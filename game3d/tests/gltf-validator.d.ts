declare module "gltf-validator" {
  interface Message { code: string; message: string; severity: number; pointer?: string }
  interface Result { issues: { numErrors: number; numWarnings: number; numInfos: number; messages: Message[] } }
  const validator: { validateBytes(bytes: Uint8Array, options?: { uri?: string }): Promise<Result> };
  export default validator;
}
