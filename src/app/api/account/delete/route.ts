import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * DELETE /api/account/delete
 *
 * Blueprint 9.3: Remove all user data from Supabase and delete the auth account.
 * Deletes: payments → reports → applications → auth user (in FK order)
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()
    const userId = user.id

    // Delete in FK order: payments → reports → applications
    await adminSupabase
      .from('payments')
      .delete()
      .eq('user_id', userId)

    await adminSupabase
      .from('reports')
      .delete()
      .eq('user_id', userId)

    await adminSupabase
      .from('applications')
      .delete()
      .eq('user_id', userId)

    // Delete auth user (this also signs them out)
    const { error: deleteError } =
      await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    // Sign out the current session
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Account deletion error:', err)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }
}
