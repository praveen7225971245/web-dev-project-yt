// require("dotenv").config({path:'./env'})
import dotenv from 'dotenv';
import connectDB from './db/DataBase.js';


dotenv.config({
  path:'./env'
})


connectDB();






















// (async()=>{
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error",(err)=>{
//       console.log("error",err);
//       throw error;
//     })

//     app.listen(process.env.PORT,()=>{
//       console.log(`Server running on address http://localhost:${process.env.PORT}`);
//     })
    
//   } catch (error) {
//     console.log("while connect the error to mongoose",error);
//     throw error;
//   }

// })();
