import { gql } from '@apollo/client';

export const QUERY_SINGLE_PROFILE = gql `
    query getSingleProfile {
        getSingleUser {
            _id
            username
            email
            savedBooks {
                _id
                authors
                description
                bookId
                image
                link
                title

            }
        }
    }
`;