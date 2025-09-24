const mongoose=require("mongoose")
const {Schema}=mongoose

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:function(){
            return !this.googleId; // Password required only if not OAuth user
        }
    },
    googleId:{
        type:String,
        sparse:true // Allows null values but ensures uniqueness when present
    },
    profilePicture:{
        type:String,
        default:null
    },
    authProvider:{
        type:String,
        enum:['local','google'],
        default:'local'
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    currentJTI:{
        type:String,
        default:null
    }
}, {
    timestamps: true
})

module.exports=mongoose.model("User",userSchema)