//.............promises..............

const asyncHandlers = (requestHandler) =>{
  return (req,res,next) =>{
    Promise.resolve(requestHandler(req,res,next))
    .catch(err=> next(err)); // 
  }
}

export {asyncHandlers};


// ................try catch..............

// const asyncHandler = () =>{}
// const asyncHandler = (func) => {() => {}}


// const asyncHandlers = (func) => async (req,res,next) => {
//   try {
//     await func(req,res,next)
//   } catch (err) {
//     res.status(err.code||500).json({
//       success:false,
//       message:err.message
//     }) 
//   }
// }