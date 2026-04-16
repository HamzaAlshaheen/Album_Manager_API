import 'dotenv/config'
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('error finding MONGO_URI')
  process.exit(1)
}

const albumsSchema = new mongoose.Schema(
  {
    artist: {
        type: String, 
        required: true , 
        trim: true,
        minlength: 3,
        maxlength: 50,

    },
    tracks: {
          type: Number,
          required: true, 
          min: [1, "Tracks must be at least 1"],
          max: [100, "Max tracks is 100"]
        },
    title:  {
      type: String, 
      required: true, 
      trim: true,
      minlength: 3,
      maxlength: 50,
      validate : {
        validator: async function (value) {
          const Album = this.model("Albums")
          const existing = await Album.findOne({
            title: value,
            _id: { $ne: this._id },
            artist: this.artist
          })
          return !existing
        },
        message: "An album with this artist and the title already exists"

      }

    },
    year: {
      type: Number, 
      required: true, 
      min: [1900, "Year must be after 1900"],
      validate: {
        validator: function (v){
          return v <= new Date().getFullYear();
        },
        message: props => `${props.value} is in the future! please enter a valid year`
      },
    
    },
    genre: {
      type: String,
      required: true,
      enum: {
        values: ['Rock', 'Pop', 'Jazz', 'Metal', 'Classical'],
        message: `{VALUE} is not supported genre`
      }
    }

  }, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}

}
)
const current_year = new Date().getFullYear()
albumsSchema.virtual("ageInYears").get(function (){
  return  current_year - this.year
})

albumsSchema.methods.isClassic = function (){
  return (current_year - this.year) > 25;
}

albumsSchema.statics.findByGenre = function (genreName){
  return this.find({genre: new RegExp(genreName, "i")})
}

const albumsModel = mongoose.model('Albums', albumsSchema)
export default albumsModel
