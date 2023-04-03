import { Request, Response } from 'express';
import Images from '@/models/Images';
import { ProductType } from '@/types/product';
import validator from 'validator';
import { User } from '@/models/User';
import Product, { ProductInstance } from '@/models/Product';
import { json } from 'body-parser';

const booleans = ['false', 'true'];

export const newProduct = async (req: Request, res: Response) => {
  try {
    let { name, description, value, quantity, isInstallments }: ProductType = req.body;
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const photos: any = req.files;

    let user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário inexistente',
        data: null,
      });
    }

    if (user) {
      if (!name || !description || !value || !quantity || !isInstallments) {
        return res.status(200).json({
          error: true,
          message: 'Preencha todos os campos',
          data: null,
        });
      }

      if (!photos) {
        return res.status(404).json({
          error: true,
          message: 'Adicione 1 imagem e no máximo 10 imagens',
          data: null,
        });
      }

      if (photos.length > 10) {
        return res.status(401).json({
          error: true,
          message: 'Limite de imagens excedido, enviar somente 10 imagens',
          data: null,
        });
      }

      if (name) {
        let nameSplitted = name.substring(0, 1).toUpperCase();
        name = nameSplitted + name.substring(1, name.length).toLocaleLowerCase();
      }

      if (description) {
        let isValidated = validator.isAlphanumeric(name, 'pt-BR', { ignore: ' ' });
        if (!isValidated) {
          return res.status(201).json({
            error: true,
            message: 'Descrição não pode conter caracteres especiais, EX: @,#,%,&',
            data: null,
          });
        }
        description = description.toLowerCase();
      }

      if (isInstallments) {
        let isValidated = booleans.includes(isInstallments) ? true : false;

        if (!isValidated) {
          return res.status(201).json({
            error: true,
            message: 'Assinale se o valor pode parcelar',
            data: null,
          });
        }
      }

      if (value) {
        let regex = /\d{1,3}(?:\.\d{3})+,\d{2}$/gm;
        let isValid = regex.test(value);
        if (!isValid) {
          return res.status(201).json({
            error: true,
            message: 'Valor invalido.',
            data: null,
          });
        }
        value = Object(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      let photo = [];
      if (photos.length >= 1) {
        for (let i in photos) {
          photo.push(
            await Images.create({
              userID: id,
              link: `${process.env.URL}/${photos[i].path.replace('public\\', '') as string}`,
            })
          );
        }
      }

      await Product.create({
        userID: id,
        name,
        description,
        photosID: photo.map((i: { id: number }) => i.id),
        value: value,
        quantity,
        isInstallments,
      });

      return res.status(200).json({
        error: false,
        message: 'Produto cadastrado com sucesso.',
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde',
      data: null,
    });
  }
};

export const updateProductInformation = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    let { name, description, value, isInstallments, quantity }: ProductType = req.body;

    if (!id) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado.',
        data: null,
      });
    }

    let product: ProductInstance | null = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado',
        data: null,
      });
    }

    if (name) {
      let nameSplitted = name.substring(0, 1).toUpperCase();
      let nameFormatted = nameSplitted + name.substring(1, name.length).toLocaleLowerCase();
      product.name = nameFormatted;
    }

    if (description) {
      let isValidated = validator.isAlphanumeric(name, 'pt-BR', { ignore: ' ' });
      if (!isValidated) {
        return res.status(201).json({
          error: true,
          message: 'Descrição não pode conter caracteres especiais, EX: @,#,%,&',
          data: null,
        });
      }

      product.description = description.toLowerCase();
    }

    if (isInstallments) {
      let isValidated = booleans.includes(isInstallments) ? true : false;

      if (!isValidated) {
        return res.status(201).json({
          error: true,
          message: 'Assinale se o valor pode parcelar',
          data: null,
        });
      }
      product.isInstallments = Boolean(isInstallments);
    }

    if (value) {
      let regex = /\d{1,3}(?:\.\d{3})+,\d{2}$/gm;
      let isValid = regex.test(value);
      if (!isValid) {
        return res.status(201).json({
          error: true,
          message: 'Valor invalido.',
          data: null,
        });
      }

      let existentR$ = value.includes('R$ ');
      if (!existentR$) {
        product.value = 'R$ ' + Object(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      } else {
        product.value = Object(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
    }

    if (quantity) {
      let isValid = validator.isNumeric(String(quantity));
      if (!isValid) {
        return res.status(201).json({
          error: true,
          message: 'Quantidade deve ser um numero.',
          data: null,
        });
      }
      product.quantity = quantity;
    }

    let productUpdated = await product.save();

    if (!productUpdated) {
      return res.status(500).json({
        error: true,
        message: 'Ocorreu um erro ao atualizar, tente mais tarde.',
        data: null,
      });
    }

    return res.status(200).json({
      error: false,
      message: 'Produto atualizado.',
      data: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro,tente mais tarde.',
      data: null,
    });
  }
};

export const deleteOneProduct = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;

    if (!id) {
      return res.status(204).json({
        error: true,
        message: 'Produto não encontrado',
        data: null,
      });
    }

    let product: ProductInstance | null = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado',
        data: null,
      });
    }

    for (let i in Object(product).photosID) {
      let photo = await Images.findByPk(Object(product).photosID[i]);
      if (photo) {
        await photo?.destroy();
      }
    }

    await product.destroy();

    return res.status(200).json({
      error: false,
      message: 'Produto excluído com sucesso',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde',
      data: null,
    });
  }
};

export const viewOneProduct = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;

    if (!id) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado',
        data: null,
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado.',
        data: null,
      });
    }

    const images = [];

    for (let i in Object(product).photosID) {
      const image = await Images.findByPk(Object(product).photosID[i]);
      images.push({ id: image?.id, link: image?.link.replace('\\', '/').replace('\\', '/') });
    }

    return res.status(200).json({
      error: false,
      message: null,
      data: { product: product, images: images },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};

export const displayAllProducts = async (req: Request, res: Response) => {
  try {
    const productAll = await Product.findAll();

    if (!productAll) {
      return res.status(404).json({
        error: true,
        message: 'Não há produto cadastrado.',
        data: null,
      });
    }

    return res.status(201).json({
      erro: false,
      message: null,
      data: productAll,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};
