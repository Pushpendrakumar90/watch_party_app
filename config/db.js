import mongoose from 'mongoose'; 

export const connectDB = async () => {
   

    try {
        
        const connection = await mongoose.connect(process.env.MONGO_URI);
        
        if (connection) {
            console.log("✅ Database is connected");
        }

    } catch (err) {
        console.log(" Database connection error: " + err.message);
       
    }
}