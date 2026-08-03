export interface ApiErrorBody {
  message: string;
  extensions?: {
    code?: string;
  };
}

export interface GraphQLErrorItem {
  message: string;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
  };
}

export interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLErrorItem[];
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly graphQLErrors: GraphQLErrorItem[];

  constructor(
    message: string,
    status: number,
    graphQLErrors: GraphQLErrorItem[] = [],
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.graphQLErrors = graphQLErrors;
  }
}
