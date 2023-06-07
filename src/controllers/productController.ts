import { Request, Response } from 'express';
import Images from '@/models/Images';
import { ProductType, UserPurchaseType } from '@/types/product';
import validator from 'validator';
import { User } from '@/models/User';
import Product, { ProductInstance } from '@/models/Product';
import UserPurchases from '@/models/UserPurchases';

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
        let regex = /^-?\d+$/;
        let isValid = regex.test(value.replace('.', '').replace(',', ''));
        if (!isValid) {
          return res.status(201).json({
            error: true,
            message: 'Valor invalido.',
            data: null,
          });
        }
        // Object(value.replace('.', '').replace(',', '')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          Object(value.replace('.', '').replace(',', ''))
        );
      }
      let photo = [];
      if (photos.length >= 1) {
        for (let i in photos) {
          photo.push(
            await Images.create({
              userID: id,
              link: `${process.env.URL}/${photos[i].path.replace('public\\', '').replace('\\', '/') as string}`,
            })
          );
        }
      }

      await Product.create({
        userID: id,
        name,
        description,
        photosID: photo.map((i) => i),
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

    for (let i in product.photosID) {
      let photo = await Images.findByPk(Object(product).photosID[i].id);
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
    if (product.photosID) {
      for (let i = 0; i < product.photosID.length; i++) {
        const image = await Images.findByPk(Object(product).photosID[i].id);
        images.push({ id: image?.id, link: image?.link.replace('\\', '/').replace('\\', '/') });
      }
    }

    return res.status(200).json({
      error: false,
      message: null,
      data: { product: product, images: images },
    });
  } catch (error) {
    console.log('error ======== ', error);
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

export const installments = async (req: Request, res: Response) => {
  try {
    const { valueTotal } = req.body;
    let value = valueTotal.replace('R$', '').replace(',', '').replace('.', '');
    let numberOfInstallments = [];
    for (let i = 1; i <= 12; i++) {
      numberOfInstallments.push({
        parcel: i,
        value: (value.substring(0, value.length - 2) / i)
          .toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
          .replace('R$', '')
          .trim(),
      });
    }

    return res.status(201).json({
      error: false,
      message: null,
      data: numberOfInstallments,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde',
      data: null,
    });
  }
};

export const purchases = async (req: Request, res: Response) => {
  try {
    const {
      userID,
      name,
      numberParcelOfValue,
      total,
      numberOfCard,
      quantity,
      photosID,
      securityCode,
      cardName,
    }: UserPurchaseType = req.body;
    const { id } = req.params;

    if (
      !userID ||
      !name ||
      !numberParcelOfValue ||
      !total ||
      !numberOfCard ||
      !quantity ||
      !photosID ||
      !securityCode ||
      !cardName
    ) {
      return res.status(400).json({
        error: true,
        message: 'Dados incompletos',
        data: null,
      });
    }

    if (name) {
      let isNameValid: boolean = validator.isAlpha(name, 'pt-BR', { ignore: ' ' });

      if (!isNameValid || name.length < 2) {
        return res.status(400).json({
          error: true,
          message: 'Nome invalido',
        });
      }
    }

    if (userID) {
      const isValidUserID = validator.isNumeric(userID.toString());

      if (!isValidUserID) {
        return res.status(400).json({
          error: true,
          message: 'Usuário invalido.',
          data: null,
        });
      }
    }

    if (quantity) {
      const isValidQuantity = validator.isNumeric(quantity.toString());

      if (!isValidQuantity) {
        return res.status(400).json({
          error: true,
          message: 'Quantidade de produto invalida.',
          data: null,
        });
      }
    }

    if (numberOfCard) {
      const isValidCard = validator.isCreditCard(numberOfCard);
      if (!isValidCard) {
        return res.status(400).json({
          error: true,
          message: 'Cartão invalido',
          data: null,
        });
      }
    }

    if (securityCode) {
      const isValidSecurityCode = validator.isNumeric(securityCode.toString());

      if (!isValidSecurityCode) {
        return res.status(400).json({
          error: true,
          message: 'Código de segurança invalido',
          data: null,
        });
      }
    }

    if (cardName.toLocaleLowerCase() === 'american express') {
      console.log('entrou AMERICAN ');

      const securityCodeLength = validator.isLength(securityCode.toString(), { min: 4, max: 4 });

      if (!securityCodeLength) {
        return res.status(400).json({
          error: true,
          message: 'Código segurança invalido.',
          data: null,
        });
      }
    }

    const typeOfCardAccepted = 'elo' || 'master card' || 'visa';
    if (cardName.toLocaleLowerCase() === typeOfCardAccepted) {
      const integerNumberLength = validator.isLength(securityCode.toString(), { min: 3, max: 3 });

      if (!integerNumberLength) {
        return res.status(400).json({
          error: true,
          message: 'Código segurança invalido.',
          data: null,
        });
      }
    }

    let lastNumbersOfCard = numberOfCard.slice(-4, numberOfCard.length).trim();
    lastNumbersOfCard = `*** ${lastNumbersOfCard}`;

    let purchase = await UserPurchases.create({
      userID: id,
      name,
      numberParcelOfValue,
      total,
      numberOfCard,
      quantity,
      photosID,
      lastNumbersOfCard,
    });

    if (!purchase) {
      return res.status(500).json({
        error: true,
        message: 'Ocorreu um erro com o pagamento',
        data: null,
      });
    }

    return res.status(201).json({
      error: false,
      message: 'Pagamento efetuado com sucesso',
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
