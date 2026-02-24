import { Client, TablesDB, ID, Query } from "appwrite"

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID = import.meta.env.VITE_APPWRITE_DATABASE_TABLE
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)

const tables = new TablesDB(client);

// export const updateSearchCount = async (searchTerm, movie) => {
//    try {
//     const result = database.
//    } catch (error) {
    
//    }
// }

export const updateSearchCount = async (searchTerm, movie) => {
    try {
      // Check if the row exists
      const result = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [
          Query.equal('searchTerm', searchTerm),
        ]
      });
  
      if (result.rows.length > 0) {
        const row = result.rows[0];
        
        // 3. New Atomic Increment! 
        // This is much cleaner and safer than manual updates.
        await tables.incrementRowColumn({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: row.$id,
            column: 'count',
            value: 1 // Defaults to 1 if omitted, but good to be explicit
          });
        
      } else {
        // 4. Using createRow instead of createDocument
        await tables.createRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: ID.unique(),
            data: {
              searchTerm,
              count: 1,
              movie_id: movie.id,
              poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }
          });
      }
    } catch (error) {
      console.error("TablesDB Error:", error);
    }
  }

  export const getTrendingMovies = async () => {
    try {
        // 1. Change from listDocuments to listRows
        // 2. Use the options object signature
        const result = await tables.listRows({
          databaseId: DATABASE_ID,
          tableId: TABLE_ID, // Ensure you use your Collection ID here
          queries: [
            Query.limit(5),
            Query.orderDesc("count")
          ]
        });
    
        // 3. Return 'rows' instead of 'documents'
        return result.rows; 
        
      } catch (error) {
        // 4. Enhanced error logging for debugging API transitions
        console.error("Error fetching trending movies from TablesDB:", error);
        return []; // Return empty array to prevent frontend mapping errors
      }
  }