import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\+?380\d{9}$/.test(v);
            },
            message: props => `${props.value} не є валідним номером телефону!`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", UserSchema);
export default User;



