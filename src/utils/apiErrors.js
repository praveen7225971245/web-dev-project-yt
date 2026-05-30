class ApiError extends Error{
  constructor(   // constructor ek special method hai jo class ke objects ko initialize karta hai. Jab bhi hum ApiError class ka object banate hain, to ye constructor call hota hai aur usme diye gaye parameters ko use karke object ke properties set karta hai.
    statusCode,
    message="Something went wrong",
    errors=[],
    stack=""
  ){
    super(message);   // ye line Error class ke constructor ko call karti hai, jisme message pass kiya jata hai. Isse ApiError class Error class se inherit karti hai aur uske properties aur methods ko use kar sakti hai.
    this.statusCode = statusCode;  
    this.errors = errors;
    this.data = null;
    this.success = false;
    this.message = message;
    if(stack){
      this.stack = stack;
    }else{
      Error.captureStackTrace(this,this.constructor);
    }
  }
}

export {ApiError};