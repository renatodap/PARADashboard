import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side operations
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'organic', utm_source, utm_medium, utm_campaign, referral_code } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('waitlist')
      .select('email, position, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      // Already signed up - return existing position
      return NextResponse.json({
        success: true,
        message: 'You are already on the waitlist!',
        position: existing.position,
        status: existing.status
      })
    }

    // Insert new waitlist entry
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: email.toLowerCase(),
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          referred_by: referral_code || null,
          status: 'pending'
        }
      ])
      .select('id, email, position, referral_code')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to add to waitlist' },
        { status: 500 }
      )
    }

    // Send welcome email (async, don't wait for response)
    sendWelcomeEmail(data.email, data.position, data.referral_code).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist!',
      position: data.position,
      referral_code: data.referral_code
    })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get waitlist stats (for public display)
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    return NextResponse.json({
      total_signups: count || 0,
      message: `${count || 0} people on the waitlist`
    })
  } catch (error) {
    console.error('Waitlist stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendWelcomeEmail(email: string, position: number, referralCode: string) {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping welcome email')
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PARA Autopilot <hello@para-autopilot.com>',
        to: email,
        subject: "You're on the waitlist! Here's what happens next",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7C3AED; font-size: 28px; margin-bottom: 16px;">Welcome to PARA Autopilot! 🎉</h1>

            <p style="font-size: 16px; line-height: 1.6; color: #1E293B;">
              Hey there,
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #1E293B;">
              You're now on the PARA Autopilot waitlist. <strong>You're #${position} in line.</strong>
            </p>

            <h2 style="color: #1E293B; font-size: 20px; margin-top: 32px; margin-bottom: 16px;">Here's what happens next:</h2>

            <ul style="font-size: 16px; line-height: 1.8; color: #1E293B;">
              <li>Week 1: We're opening early access to the first 100 people</li>
              <li>You'll get an invite with <strong>50% off forever</strong> ($10/month instead of $20)</li>
              <li>If you don't love it, cancel anytime</li>
            </ul>

            <div style="background: #F7FAFC; border-left: 4px solid #7C3AED; padding: 20px; margin: 32px 0; border-radius: 8px;">
              <p style="font-size: 16px; line-height: 1.6; color: #1E293B; margin: 0;">
                <strong>Want to skip the line?</strong><br>
                Refer 3 friends and get immediate access.<br>
                Your referral link: <code style="background: #E2E8F0; padding: 2px 8px; border-radius: 4px;">https://para-autopilot.com/landing?ref=${referralCode}</code>
              </p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #1E293B;">
              While you wait, I want to ask: <strong>what made you sign up?</strong>
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #1E293B;">
              Just hit reply and tell me. I read every response.
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #1E293B; margin-top: 32px;">
              - Renato<br>
              <span style="color: #64748B; font-size: 14px;">Founder, PARA Autopilot</span>
            </p>
          </div>
        `
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
    } else {
      // Update waitlist with email sent timestamp
      await supabase
        .from('waitlist')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('email', email)
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}
