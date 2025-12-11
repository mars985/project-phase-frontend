export type Prompt = {
  _id: string;
  prompt: string;
  image?: {
    data: string;        // base64 encoded string
    contentType: string;
  };
};
