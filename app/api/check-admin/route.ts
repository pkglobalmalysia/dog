import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Check admin users
    const { data: adminUsers, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "admin");
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      adminUsers,
      count: adminUsers?.length || 0
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
