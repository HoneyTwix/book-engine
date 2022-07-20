const { AuthenticationError } = require("apollo-server-express")
const { User } = require("../models")
const { signToken } = require("../utils/auth")

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user_id })
        return user
      }

      throw new AuthenticationError("Not Logged In")
    },
  },
  Mutation: {
    login: async (parent, { email, username, password }) => {
      const user = await User.findOne(username)
      if (!user) {
        throw new AuthenticationError("Incorrect credentials")
      }
      const correctPw = await user.isCorrectPassword(password)
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials")
      }
      const token = signToken(user)
      return { token, user }
    },
    addUser: async (parent, args) => {
      const user = await User.create(args)
      const token = signToken(user)
      return { token, user }
    },
    saveBook: async (parent, args, context) => {
      const savedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: args.book } },
        { new: true, runValidators: true }
      )
      return savedUser
    },
    removeBook: async (parent, args, context) => {
      const savedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      )
      return savedUser
    },
  },
}

module.exports = resolvers