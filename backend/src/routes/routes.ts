import { Router, Request, Response } from 'express';
import { AuthUserController } from '../controllers/user/AuthUserController.js'
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
// Imports dos Controllers (ajuste os caminhos se necessário)
import { CreateCategoryController } from '../controllers/category/CreateCategoryController.js';
import { UpdateCategoryController } from '../controllers/category/UpdateCategoryController.js';
import { DeleteCategoryController } from '../controllers/category/DeleteCategoryController.js';

import { CreateTransactionController } from '../controllers/transaction/CreateTransactionController.js';
import { UpdateTransactionController } from '../controllers/transaction/UpdateTransactionController.js';
import { DeleteTransactionController } from '../controllers/transaction/DeleteTransactionController.js';

import { DeleteUserController } from '../controllers/user/DeleteUserController.js';
import { UpdateUserController } from '../controllers/user/UpdateUserController.js';
import { CreateUserController } from '../controllers/user/CreateUserController.js';
import { CurrentUserController } from '../controllers/user/CurrentUserController.js';

import { ListCategoryController } from '../controllers/category/ListCategoryController.js';
import { ListTransactionController } from '../controllers/transaction/ListTransactionController.js';

import { CreateInstallmentController } from '../controllers/installment/CreateInstallmentController.js';
import { ListInstallmentsController } from '../controllers/installment/ListInstallmentsController.js';
import { DeleteInstallmentController } from '../controllers/installment/DeleteInstallmentController.js';

import { CreateFixedExpenseController } from '../controllers/fixedExpense/CreateFixedExpenseController.js';
import { ListFixedExpensesController } from '../controllers/fixedExpense/ListFixedExpensesController.js';
import { DeleteFixedExpenseController } from '../controllers/fixedExpense/DeleteFixedExpenseController.js';
import { WhatsAppBotService } from '../services/whatsapp/WhatsAppBotService.js';

const routes = Router();

// =================== ROTA DE AUTENTICAÇÃO ===================
const authUserController = new AuthUserController();
routes.post('/login', authUserController.handle);

// =================== ROTAS DE CATEGORIA ===================
const createCategoryController = new CreateCategoryController();
const updateCategoryController = new UpdateCategoryController();
const deleteCategoryController = new DeleteCategoryController();
const listCategoryController = new ListCategoryController();

routes.post('/categories', isAuthenticated, createCategoryController.handle);
routes.put('/categories/:id', isAuthenticated, updateCategoryController.handle);
routes.delete('/categories/:id', isAuthenticated, deleteCategoryController.handle);
routes.get('/categories', isAuthenticated, listCategoryController.handle);

// =================== ROTAS DE TRANSAÇÃO ===================
const createTransactionController = new CreateTransactionController();
const updateTransactionController = new UpdateTransactionController();
const deleteTransactionController = new DeleteTransactionController();
const listTransactionController = new ListTransactionController();

routes.post('/transactions', isAuthenticated, createTransactionController.handle);
routes.put('/transactions/:id', isAuthenticated, updateTransactionController.handle);
routes.delete('/transactions/:id', isAuthenticated, deleteTransactionController.handle);
routes.get('/transactions', isAuthenticated, listTransactionController.handle);

// =================== ROTAS DE USUÁRIO ===================
const createUserController = new CreateUserController();
const updateUserController = new UpdateUserController();
const deleteUserController = new DeleteUserController();
const currentUserController = new CurrentUserController(); 

routes.post('/users', isAuthenticated, createUserController.handle);
routes.put('/users', isAuthenticated, updateUserController.handle);
routes.delete('/users/:id', isAuthenticated, deleteUserController.handle);
routes.get('/me', isAuthenticated, currentUserController.handle);

// =================== ROTAS DE PARCELAMENTO ===================
const createInstallmentController = new CreateInstallmentController();
const listInstallmentsController = new ListInstallmentsController();
const deleteInstallmentController = new DeleteInstallmentController();

routes.post('/installments', isAuthenticated, createInstallmentController.handle);
routes.get('/installments', isAuthenticated, listInstallmentsController.handle);
routes.delete('/installments/:id', isAuthenticated, deleteInstallmentController.handle);

// =================== ROTAS DE DESPESAS FIXAS ===================
const createFixedExpenseController = new CreateFixedExpenseController();
const listFixedExpensesController = new ListFixedExpensesController();
const deleteFixedExpenseController = new DeleteFixedExpenseController();

routes.post('/fixed-expenses', isAuthenticated, createFixedExpenseController.handle);
routes.get('/fixed-expenses', isAuthenticated, listFixedExpensesController.handle);
routes.delete('/fixed-expenses/:id', isAuthenticated, deleteFixedExpenseController.handle);

//health
routes.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

// Instancia o serviço apenas uma vez quando a API sobe
const botService = new WhatsAppBotService();

// Define os tipos Request e Response e retorna o res.json
routes.post('/chat/process', async (req: Request, res: Response): Promise<any> => {
  try {
    const { message, userId } = req.body;

    // Adapte o payload para o formato que o seu Service já espera
    const payload = {
      chatId: userId, // Usamos o ID do usuário como identificador da "conversa"
      message: message,
      fromMe: false 
    };

    const respostaIA = await botService.processarMensagem(payload);

    return res.json({ sucesso: true, resposta: respostaIA });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ sucesso: false, mensagem: "Erro interno" });
  }
});


export { routes };