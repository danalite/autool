import { request } from "@/utils/render/request";

export const testOCR = async (req, res) => {
  const { url } = req.body;
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  const image = Buffer.from(data, 'binary');
  const text = await ocr(image);
  res.send(text);
}