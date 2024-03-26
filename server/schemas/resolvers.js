const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        users: async () => {
            return await User.find();
        },
        getSingleUser: async (parent, args, context) => {
            if (context.user) {
                return await User.findById(context.user._id)
            }
            throw AuthenticationError
        },
    },
    Mutation: {
        createUser: async (parent, { username, email, password }) => {
            const newUser = await User.create({ username, email, password });
            const token = signToken(newUser);

            return { token, user: newUser };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError
            }

            const token = signToken(user);
            return { token, user }
        },
        saveBook: async (parent, { bookData }, context) => {
            if (!context.user) {
                throw AuthenticationError
            }

            // const bookData = {
            //     bookId,
            //     authors,
            //     title,
            //     description,
            //     image,
            //     link
            // };

            try {
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id, 
                    { $addToSet: { savedBooks: bookData }}, 
                    { new: true, runValidators: true }
                    ).populate('savedBooks');
                    return updatedUser;
            } catch(err) {
                console.error(err);
            }
        },
        deleteBook: async (parent, { bookId }, context) => {
            try {
                if (!context.user) {
                    throw AuthenticationError
                }
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { savedBooks: { bookId: bookId } }},
                    { new: true, runValidators: true }
                ).populate('savedBooks');
                return updatedUser;
            } catch(err) {
                console.error(err);
            }
        }
    },
};

module.exports = resolvers;