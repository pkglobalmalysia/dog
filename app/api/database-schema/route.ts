import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get all tables in public schema
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type, table_schema')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name')

    // Get all columns with their details
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select(`
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        ordinal_position
      `)
      .eq('table_schema', 'public')
      .order('table_name')
      .order('ordinal_position')

    // Get foreign key relationships
    const { data: foreignKeys } = await supabase
      .from('information_schema.key_column_usage')
      .select(`
        table_name,
        column_name,
        constraint_name,
        referenced_table_name,
        referenced_column_name
      `)
      .eq('table_schema', 'public')
      .not('referenced_table_name', 'is', null)

    // Get primary keys
    const { data: primaryKeys } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        table_name,
        constraint_name,
        constraint_type
      `)
      .eq('table_schema', 'public')
      .eq('constraint_type', 'PRIMARY KEY')

    // Get indexes
    const { data: indexes } = await supabase
      .from('pg_indexes')
      .select('tablename, indexname, indexdef')
      .eq('schemaname', 'public')

    // Organize data by table
    const schemaOverview: Record<string, any> = {}
    
    // Initialize tables
    if (tables) {
      tables.forEach(table => {
        schemaOverview[table.table_name] = {
          table_type: table.table_type,
          columns: [],
          primary_keys: [],
          foreign_keys: [],
          indexes: []
        }
      })
    }

    // Add columns
    if (columns) {
      columns.forEach(col => {
        if (schemaOverview[col.table_name]) {
          schemaOverview[col.table_name].columns.push({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            default: col.column_default,
            max_length: col.character_maximum_length,
            precision: col.numeric_precision,
            scale: col.numeric_scale,
            position: col.ordinal_position
          })
        }
      })
    }

    // Add foreign keys
    if (foreignKeys) {
      foreignKeys.forEach(fk => {
        if (schemaOverview[fk.table_name]) {
          schemaOverview[fk.table_name].foreign_keys.push({
            column: fk.column_name,
            references_table: fk.referenced_table_name,
            references_column: fk.referenced_column_name,
            constraint: fk.constraint_name
          })
        }
      })
    }

    // Add primary keys
    if (primaryKeys) {
      primaryKeys.forEach(pk => {
        if (schemaOverview[pk.table_name]) {
          schemaOverview[pk.table_name].primary_keys.push({
            constraint: pk.constraint_name,
            type: pk.constraint_type
          })
        }
      })
    }

    // Add indexes
    if (indexes) {
      indexes.forEach(idx => {
        if (schemaOverview[idx.tablename]) {
          schemaOverview[idx.tablename].indexes.push({
            name: idx.indexname,
            definition: idx.indexdef
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_tables: Object.keys(schemaOverview).length,
        table_names: Object.keys(schemaOverview).sort()
      },
      schema_details: schemaOverview,
      sql_queries: {
        tables: "SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
        columns: "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public'",
        foreign_keys: "SELECT table_name, column_name, referenced_table_name, referenced_column_name FROM information_schema.key_column_usage WHERE table_schema = 'public' AND referenced_table_name IS NOT NULL",
        primary_keys: "SELECT table_name, constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_type = 'PRIMARY KEY'",
        indexes: "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'"
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database schema query error:', error)
    return NextResponse.json({
      error: 'Failed to fetch database schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
