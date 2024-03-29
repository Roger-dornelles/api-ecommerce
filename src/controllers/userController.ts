import { JwtSign } from '@/helpers/jwt';
import { Request, Response } from 'express';
import { CreateUser, updateUserType } from '@/types/user';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import { User } from '@/models/User';
import { States } from '@/models/States';
import { userAuthenticated } from '@/auth/auth';

let states: string[];
const statesDB = async () => {
  let statesArray = await States.findAll();

  states = statesArray.map((i) => i.name);
};
statesDB();

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, cpf, logradouro, number, contact, state, password, district }: CreateUser = req.body;

    if (!name || !email || !cpf || !logradouro || !number || !contact || !state || !password || !district) {
      return res.status(201).json({
        error: true,
        message: 'Preencha todos os campos.',
        data: null,
      });
    }

    if (name.length < 2) {
      return res.status(201).json({
        error: true,
        message: 'Nome deve conter 2 caracteres ou mais',
        data: null,
      });
    } else {
      let isNameValid: boolean = validator.isAlpha(name, 'pt-BR', { ignore: ' ' });

      if (!isNameValid) {
        return res.status(201).json({
          error: true,
          message: 'Digite um nome valido.',
          data: null,
        });
      }
    }

    if (cpf) {
      let isValid: boolean = validator.isNumeric(cpf.toString());
      if (!isValid) {
        return res.status(201).json({
          error: true,
          message: 'Cpf invalido',
          data: null,
        });
      }
    }

    if (email) {
      let user = await User.findOne({ where: { email } });

      if (user?.email) {
        return res.status(201).json({ error: true, message: 'Email já cadastrado.', data: null });
      }

      let isEmailValid: boolean = validator.isEmail(email);
      if (!isEmailValid) {
        return res.status(201).json({
          error: true,
          message: 'Email invalido',
          data: null,
        });
      }
    }

    if (contact) {
      let isContactValid: boolean = validator.isMobilePhone(contact.toString(), 'pt-BR');
      if (!isContactValid) {
        return res.status(201).json({
          error: true,
          message: 'Numero de celular invalido.',
          data: null,
        });
      }
    }

    if (password.length < 9) {
      return res.status(201).json({
        error: true,
        message: 'Senha precisa ser de 9 caracteres ou mais.',
        data: null,
      });
    }

    if (password && password.length >= 9) {
      const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{9,}$/;
      const isPasswordValid = regex.test(password);
      if (!isPasswordValid) {
        return res.status(201).json({
          error: true,
          message: 'Senha deve ser maior de 9 caracteres, deve conter letra maiúscula, minúscula e carácter especial',
          data: null,
        });
      }
    }

    if (state) {
      let isStateValid: boolean = states.includes(state.toUpperCase());

      if (!isStateValid) {
        return res.status(201).json({
          error: true,
          message: 'Estado invalido',
          data: null,
        });
      }
    }

    if (district) {
      let isDistrictValid: boolean = validator.isAlpha(district, 'pt-BR', { ignore: ' ' });

      if (!isDistrictValid) {
        return res.status(201).json({
          error: true,
          message: 'Bairro invalido.',
          data: null,
        });
      }
    }
    const passwordHash = await bcrypt.hashSync(password, 10);
    const cpfHash = await bcrypt.hashSync(cpf.toString(), 10);

    const firstCaracterUpperCase = name.substring(1, 0)[0].toUpperCase();
    const nameUppercase = firstCaracterUpperCase + name.substring(1, name.length).toLowerCase();

    let userCreated = await User.create({
      name: nameUppercase,
      email,
      password: passwordHash,
      logradouro,
      contact,
      number,
      state: state.toUpperCase(),
      cpf: cpfHash,
      district,
    });

    if (userCreated) {
      let token = await JwtSign({ id: userCreated.id, email: userCreated.email });

      return res.status(201).json({ error: false, message: 'Usuário cadastrado com sucesso.', data: token });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
      return res.status(404).json({
        error: true,
        message: 'Preencha todos os campos.',
        data: null,
      });
    }

    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return res.status(201).json({
        error: true,
        message: 'Digite um email valido.',
        data: null,
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário invalido',
        data: null,
      });
    }

    const isvalidPassword = bcrypt.compare(password, user.password);
    if (!isvalidPassword) {
      return res.status(201).json({
        error: true,
        message: 'Email e/ou senha inválidos.',
        data: null,
      });
    }

    const token = await JwtSign({ id: user?.id, email });
    return res.status(201).json({
      error: false,
      message: 'Usuário logado com sucesso.',
      data: token,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, password, email, contact, logradouro, number, state }: updateUserType = req.body;

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

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário invalido',
        data: null,
      });
    }

    if (name) {
      const isNameValid: boolean = validator.isAlpha(name, 'pt-BR', { ignore: ' ' });
      if (!isNameValid) {
        return res.status(201).json({
          error: true,
          message: 'Digite um nome valido',
          data: null,
        });
      }
      const firstCaracterUpperCase = name.substring(1, 0)[0].toUpperCase();
      user.name = firstCaracterUpperCase + name.substring(1, name.length);
    }

    if (password && password.length < 9) {
      return res.status(201).json({
        error: true,
        message: 'Senha precisa ser de 9 caracteres ou mais.',
        data: null,
      });
    }

    if (password && password.length >= 9) {
      const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{9,}$/;
      const isPasswordValid = regex.test(password);
      if (!isPasswordValid) {
        return res.status(201).json({
          error: true,
          message: 'Senha deve ser maior de 9 caracteres, deve conter letra maiúscula, minúscula e carácter especial',
          data: null,
        });
      }

      user.password = bcrypt.hashSync(password, 10);
    }

    if (email) {
      const isEmailValid: boolean = validator.isEmail(email);
      if (!isEmailValid) {
        return res.status(201).json({
          error: true,
          message: 'Digite um email valido',
          data: null,
        });
      }

      user.email = email;
    }

    if (contact) {
      let isContactValid: boolean = validator.isMobilePhone(contact.toString(), 'pt-BR');
      if (!isContactValid) {
        return res.status(201).json({
          error: true,
          message: 'Numero de celular invalido.',
        });
      }

      user.contact = contact.toString();
    }

    if (state) {
      let isStateValid: boolean = states.includes(state.toUpperCase());

      if (!isStateValid) {
        return res.status(201).json({
          error: true,
          message: 'Estado invalido',
          data: null,
        });
      }
      user.state = state.toUpperCase();
    }

    if (logradouro) {
      user.logradouro = logradouro;
    }

    if (number) {
      user.number = number;
    }

    const userUpdated = await user.save();

    if (userUpdated) {
      return res.status(201).json({
        error: false,
        message: 'Usuário atualizado com sucesso',
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
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

    if (id) {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          error: true,
          massage: 'Usuário inexistente',
          data: null,
        });
      }

      await user.destroy();

      return res.status(200).json({
        error: false,
        message: 'Usuário excluído com sucesso',
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro,tente mais tarde.',
    });
  }
};

export const userInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado.',
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

    if (req.user.id === Number(id)) {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'Usuário inexistente',
          data: null,
        });
      }

      return res.status(201).json({
        error: false,
        message: null,
        data: user,
      });
    } else {
      return res.status(401).json({
        error: true,
        message: 'Usuário sem autorização.',
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
      data: null,
    });
  }
};
