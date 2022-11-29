export type SentResource = Readonly<{
  resourceTypeId: number;
  count: number;
}>;

export type SentResources = {
  [key: string]: SentResource;
};
