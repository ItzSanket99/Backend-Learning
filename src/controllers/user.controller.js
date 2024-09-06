import { asyncHandaler} from "../utils/asyncHandaler.js"
import  { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/fileUpload.js"
import { apiResponse } from "../utils/apiResponse.js"
 
const registerUser = asyncHandaler( async (req, res) => {
    const {username, email, fullname, password} = req.body

    console.log("email :",email);

    if(
        [username,email,fullname,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"all field are requried")
    }

    const existedUser = User.findOne({
        $or: [{ username } , { email }]
    })

    if(existedUser) {
        throw new ApiError(409, "user with email or username allready exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400,"avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",  
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while regestring the user")
    }


    return res.status(201).json(
        new apiResponse(200, createdUser, "user registed successfully")
    )
} )
    

export { registerUser }