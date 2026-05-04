const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Only add endpoint if it's explicitly provided and not a standard AWS one
  ...(process.env.AWS_S3_ENDPOINT &&
    !process.env.AWS_S3_ENDPOINT.includes("amazonaws.com") && {
      endpoint: process.env.AWS_S3_ENDPOINT,
      forcePathStyle: true,
    }),
});

exports.uploadFile = async (file) => {
  const fileKey = `resumes/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(params));

  // We return the key instead of a static URL for better security
  return { key: fileKey };
};

exports.extractS3Key = (value) => {
  if (!value || typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  if (!/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
  } catch (error) {
    return null;
  }
};

exports.getPresignedUrl = async (key) => {
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  // URL valid for 1 hour (3600 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 604800 });
};

exports.deleteFile = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(params));
};
