import Images from '@/models/Images';
import Product from '@/models/Product';
import { Request, Response } from 'express';
import { unlink } from 'fs/promises';

export const deleteOneImage = async (req: Request, res: Response) => {
  try {
    let { imageID, userID } = req.params;

    if (!imageID) {
      return res.status(404).json({
        erro: true,
        message: 'Imagem não encontrada',
        data: null,
      });
    }
    let image = await Images.findByPk(imageID);
    let product = await Product.findByPk(userID);

    if (!image) {
      return res.status(404).json({
        error: true,
        message: 'Imagem não encontrada',
        data: null,
      });
    }

    let imagesId = product?.photosID as unknown as Array<unknown>;
    let imageDeleted = imagesId?.filter((id) => {
      return id != imageID;
    });

    if (imageDeleted) {
      Object(product).photosID = imageDeleted;
      await product?.save();
    }

    let isIncludedInTheUrl = image.link.includes('5000/');
    if (isIncludedInTheUrl) {
      let imageSplitted = image?.link.split(`5000/`, image.link.length)[1];
      await unlink(imageSplitted as string);
    }

    await image.destroy();
    return res.status(200).json({
      error: false,
      message: 'Imagem excluída com sucesso.',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};
