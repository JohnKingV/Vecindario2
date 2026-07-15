// Follow this setup guide to integrate with Odoo:
// https://supabase.com/docs/guides/functions/examples/odoo-xmlrpc

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ODOO_URL = Deno.env.get('ODOO_URL')
const ODOO_DB = Deno.env.get('ODOO_DB')
const ODOO_USER = Deno.env.get('ODOO_USER')
const ODOO_API_KEY = Deno.env.get('ODOO_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { model, method, args, kwargs = {} } = await req.json()

    // 1. Authenticate to get UID
    const authPayload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]
      },
      id: Date.now(),
    }

    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authPayload)
    })

    const authResult = await authRes.json()
    if (authResult.error) throw authResult.error
    const uid = authResult.result

    if (!uid) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Execute the call
    const callPayload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [ODOO_DB, uid, ODOO_API_KEY, model, method, args, kwargs]
      },
      id: Date.now() + 1,
    }

    const callRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callPayload)
    })

    const callResult = await callRes.json()
    
    return new Response(JSON.stringify(callResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
