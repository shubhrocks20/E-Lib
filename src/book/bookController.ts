import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { genre, title } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);

  const fileName = files.coverImage[0].filename;
  const filepath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );
  const bookFileName = files.file[0].filename;
  const bookFilePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    bookFileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );
    // @ts-ignore
    console.log("userId", req.userId);
    const newBook = await bookModel.create({
      title,
      genre,
      author: "66228314dad972b8ee5be476",
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });
    // Delete Temp Files
    await fs.promises.unlink(filepath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({ id: newBook._id });
  } catch (err) {
    return next(createHttpError(500, "Error while uploading files"));
  }
};

export { createBook };
