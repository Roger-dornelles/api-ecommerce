import { Request, Response } from 'express';
import Images from '@/models/Images';
import { ProductType, UserPurchaseType } from '@/types/product';
import validator from 'validator';
import { User } from '@/models/User';
import Product, { ProductInstance } from '@/models/Product';
import UserPurchases from '@/models/UserPurchases';
import bcrypt from 'bcryptjs';
import { userAuthenticated } from '@/auth/auth';

const booleans = ['false', 'true'];

export const newProduct = async (req: Request, res: Response) => {
  try {
    let { name, description, value, quantity, isInstallments }: ProductType = req.body;
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const photos: any = req.files;

    if (!id) {
      return res.status(404).json({
        erro: true,
        message: 'Usuário inexistente',
        data: null,
      });
    }

    const isUserAuthenticated = await userAuthenticated(req, id);

    if (isUserAuthenticated?.error) {
      return res.status(401).json({
        error: true,
        message: isUserAuthenticated?.message,
        data: null,
      });
    }

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
      const newValue = value.replace('R$', '').replace('.', '').replace(',', '').trim();
      
      // let regex = /\d{1,3}(?:\.\d{3})+,\d{2}$/gm;
      let isValid = validator.isNumeric(newValue)
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
      numberParcelOfValue,
      total,
      numberOfCard,
      securityCode,
      cardName,
      userProductDataOfPurchase,
      deliveryAddress,
      name,
      phone,
      address,
      complement,
      dueDate,
      numberAddress,
    }: UserPurchaseType = req.body;

    const { id } = req.params;

    if (!id) {
      return res.status(404).json({
        error: true,
        message: 'Usuário inexistente',
        data: null,
      });
    }

    const isUserAuthenticated = await userAuthenticated(req, id);

    if (isUserAuthenticated?.error) {
      return res.status(401).json({
        error: true,
        message: isUserAuthenticated?.message,
        data: null,
      });
    }

    if (
      !userID ||
      !numberParcelOfValue ||
      !total ||
      !numberOfCard ||
      !securityCode ||
      !cardName ||
      !userProductDataOfPurchase ||
      !deliveryAddress ||
      !name ||
      !phone ||
      !address ||
      !complement ||
      !dueDate ||
      !numberAddress
    ) {
      return res.status(400).json({
        error: true,
        message: 'Dados incompletos',
        data: null,
      });
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

    if (dueDate) {
      const regex = /^(0[1-9]|1[0-2])(\/)((2[3-9]|4[0-9])$)/;

      const isDueDateValid = regex.test(dueDate);

      if (!isDueDateValid) {
        return res.status(400).json({
          error: true,
          message: 'Data de validade do cartão invalido',
          data: null,
        });
      }
    }

    if (name) {
      if (name.length < 2) {
        return res.status(400).json({
          error: true,
          message: 'Nome invalido',
          data: null,
        });
      }
      const isNameValid: boolean = validator.isAlpha(name, 'pt-BR', { ignore: ' ' });

      if (!isNameValid) {
        return res.status(400).json({
          error: true,
          message: 'Nome invalido',
          data: null,
        });
      }
    }

    if (phone) {
      const isValidPhone = validator.isMobilePhone(phone);

      if (!isValidPhone || phone.length < 15) {
        return res.status(400).json({
          error: true,
          message: 'Numero do celular invalido',
          data: null,
        });
      }
    }

    if (address) {
      let regex = /^[A-Za-z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/;

      const isAddressValid = address.match(regex);

      if (!isAddressValid) {
        return res.status(400).json({
          error: true,
          message: 'Endereço invalido',
          data: null,
        });
      }
    }

    if (numberAddress) {
      const isNumberAddressValid = validator.isNumeric(numberAddress, { locale: 'pt-BR' });

      if (!isNumberAddressValid) {
        return res.status(400).json({
          error: true,
          message: 'Numero do endereço invalido',
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

    const numberCardHash = await bcrypt.hashSync(numberOfCard, 10);
    const securityCodeHash = await bcrypt.hashSync(securityCode.toString(), 10);

    let lastNumbersOfCard = numberOfCard.slice(-4, numberOfCard.length).trim();
    lastNumbersOfCard = `*** ${lastNumbersOfCard}`;

    let purchase = await UserPurchases.create({
      userID,
      numberParcelOfValue,
      total,
      numberOfCard: numberCardHash,
      userProductDataOfPurchase,
      lastNumbersOfCard,
      securityCode: securityCodeHash,
      cardName,
      phone,
      dueDate,
      complement: complement ? complement : '',
      numberAddress,
      deliveryAddress,
      name,
      address,
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

export const userPurchases = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({
        erro: true,
        message: 'Usuário não encontrado',
        data: null,
      });
    }

    const isUserAuthenticated = await userAuthenticated(req, id);

    if (isUserAuthenticated?.error) {
      return res.status(401).json({
        error: true,
        message: isUserAuthenticated?.message,
        data: null,
      });
    }

    const purchases = await UserPurchases.findAll({ where: { userID: id } });

    if (!purchases) {
      return res.status(200).json({
        error: true,
        message: 'Não há compras.',
        data: null,
      });
    }

    return res.status(201).json({
      error: false,
      message: null,
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};

export const displayProductUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado',
        data: null,
      });
    }

    const isUserAuthenticated = await userAuthenticated(req, id);

    if (isUserAuthenticated?.error) {
      return res.status(401).json({
        error: true,
        message: isUserAuthenticated?.message,
        data: null,
      });
    }

    const productUserLogged = await Product.findAll({
      where: {
        userID: id,
      },
    });

    return res.status(201).json({
      error: false,
      message: null,
      data: productUserLogged,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};
