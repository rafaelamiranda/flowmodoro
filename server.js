import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Conexão com MongoDB de forma assíncrona
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false // Desativa o buffer de comandos
    });
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1); // Encerra o processo com erro
  }
};

// Chamada da função de conexão
connectDB();

app.use(express.json());

// Modelo de tarefa para o MongoDB usando Mongoose
const TaskSchema = new mongoose.Schema({
  name: String,
  focusTime: Number,
});
const Task = mongoose.model('Task', TaskSchema);

// Rota para buscar todas as tarefas
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para adicionar uma nova tarefa
app.post('/api/tasks', async (req, res) => {
  const task = new Task({
    name: req.body.name,
    focusTime: req.body.focusTime,
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskToDelete = await Task.findByIdAndDelete(taskId);

    if (!taskToDelete) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({ message: "Tarefa apagada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao apagar a tarefa" });
  }
});

app.put('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { name, focusTime } = req.body;
    const taskToUpdate = await Task.findByIdAndUpdate(taskId, { name, focusTime });

    if (!taskToUpdate) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({ message: "Tarefa atualizada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar a tarefa" });
  }
})


// Inicia o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
