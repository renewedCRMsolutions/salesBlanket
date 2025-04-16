import { gql } from 'apollo-server-express';
import { entity } from './entity';
import { collection } from './collection';
import { form } from './form';
import { engagement } from './engagement';
import { user } from './user';
import { scalars } from './scalars';
import { enums } from './enums';

const typeDefs = gql`
  # Root types for schema - these are extended by individual modules
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

export default [
  typeDefs,
  scalars,
  enums,
  entity,
  collection,
  form,
  engagement,
  user
];