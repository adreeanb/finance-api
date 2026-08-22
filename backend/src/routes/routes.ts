import { Router, Request, Response } from 'express';
import { AuthUserController } from '../controllers/user/AuthUserController'
import { isAuthenticated } from '../middlewares/isAuthenticated';
// Imports dos Controllers (ajuste os caminhos se necessário)
import { CreateCategoryController } from '../controllers/category/CreateCategoryController';
import { UpdateCategoryController } from '../controllers/category/UpdateCategoryController';
import { DeleteCategoryController } from '../controllers/category/DeleteCategoryController';

import { CreateTransactionController } from '../controllers/transaction/CreateTransactionController';
import { UpdateTransactionController } from '../controllers/transaction/UpdateTransactionController';
import { DeleteTransactionController } from '../controllers/transaction/DeleteTransactionController';

import { DeleteUserController } from '../controllers/user/DeleteUserController';
import { UpdateUserController } from '../controllers/user/UpdateUserController';
import { CreateUserController } from '../controllers/user/CreateUserController';
import { CurrentUserController } from '../controllers/user/CurrentUserController';

import { ListCategoryController } from '../controllers/category/ListCategoryController';
import { ListTransactionController } from '../controllers/transaction/ListTransactionController';

import { CreateInstallmentController } from '../controllers/installment/CreateInstallmentController';
import { ListInstallmentsController } from '../controllers/installment/ListInstallmentsController';
import { DeleteInstallmentController } from '../controllers/installment/DeleteInstallmentController';

import { CreateFixedExpenseController } from '../controllers/fixedExpense/CreateFixedExpenseController';
import { ListFixedExpensesController } from '../controllers/fixedExpense/ListFixedExpensesController';
import { DeleteFixedExpenseController } from '../controllers/fixedExpense/DeleteFixedExpenseController';
import { WhatsAppBotService } from '../services/whatsapp/WhatsAppBotService';

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

routes.post('/users', createUserController.handle);
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
routes.post('/api/chat/process', async (req: Request, res: Response): Promise<any> => {
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