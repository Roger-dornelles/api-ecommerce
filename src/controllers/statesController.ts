import { States } from '@/models/States';
import { Request, Response } from 'express';
import validator from 'validator';

export const addState = async (req: Request, res: Response) => {
  try {
    const { state } = req.body;

    if (!state) {
      return res.status(201).json({
        error: true,
        message: 'Preencha o campo.',
        data: null,
      });
    }
    let isStateValid: boolean = validator.isAlpha(state, 'pt-BR', { ignore: ' ' });
    console.log(isStateValid);
    if (!isStateValid) {
      return res.status(201).json({
        error: true,
        message: 'Estado não pode conter caracteres especiais ou números.',
        data: null,
      });
    }

    const stateVerified = await States.findOne({ where: { name: state.toUpperCase() } });

    if (stateVerified) {
      return res.status(201).json({
        error: true,
        massage: 'Estado já cadastrado.',
        data: null,
      });
    }

    await States.create({
      name: state.toUpperCase(),
    });

    return res.status(201).json({
      error: false,
      message: 'Estado adicionado com sucesso',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde.',
    });
  }
};
