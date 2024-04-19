import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

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
    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const { bookId } = req.params;

  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book"));
  }
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);

    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );

    completeCoverImage = filename;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "book-covers",
    });
    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );
    const bookFileName = files.file[0].filename;

    completeFileName = bookFileName;
    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-pdfs",
      format: "pdf",
    });
    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }
  try {
    const updatedBook = await bookModel.findByIdAndUpdate(
      {
        _id: bookId,
      },
      {
        title,
        genre,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completeFileName ? completeFileName : book.file,
      },
      { new: true }
    );
    res.json({ msg: "OK", updatedBook });
  } catch (err) {
    return next(createHttpError(500, "Error while updating book"));
  }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find();

    res.json(books);
  } catch (err) {
    return next(createHttpError(500, "Error while fetching books"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { bookId } = req.params;

  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "book not found"));
    }

    res.json(book);
  } catch (err) {
    return next(createHttpError(500, "Error while fetching book"));
  }
};

export { createBook, updateBook, listBooks, getSingleBook };
