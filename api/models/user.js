const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxLength:20
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        validate:[isEmail, 'Please enter a valid email address']
    },
    password:{
        type:String,
        required:true,
        maxlength:16
    },
    verified:{
        type:Boolean,
        default:false
    },
    verificationToken:String,
    profileImage:String,
    userDescription:{
        type:String,
        default:null
    },
    connections:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    connectionRequest:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    setConnectionRequest:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
});

userSchema.pre('save', async function(next){
    // hash password before saving..
    // if the password field is not modified skip this method 'pre' methdd
    // and go to the other...
    // if its modified hash the password and save it.. 
    if (!this.isModified('password')){
        return next();
    }
    // hashing the password..
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();    
})

// method to check password
userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.post('save', function (doc, next){
    console.log('Document created and saved successfully', doc);
    console.log('MongoDB Database Name:', this.db.name);
    console.log('MongoDB Collection Name:', this.collection.name);
    next();
})

const User = mongoose.model("User", userSchema, 'users');
module.exports = User;