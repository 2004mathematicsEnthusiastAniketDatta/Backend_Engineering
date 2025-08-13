#!/usr/bin/env node
import 'dotenv/config';
import readline from 'readline';

const API_URL = process.env.API_URL || 'http://localhost:3000';

type Todo = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

function printHelp() {
  console.log('Commands:');
  console.log('  list                 - list todos');
  console.log('  add <title>          - add a todo');
  console.log('  done <id>            - mark complete');
  console.log('  delete <id>          - delete todo');
  console.log('  help                 - show help');
  console.log('  exit                 - quit');
}

async function listTodos() {
  const res = await fetch(`${API_URL}/api/todos`);
  const todos: Todo[] = await res.json();
  if (todos.length === 0) return console.log('No todos');
  for (const t of todos) {
    console.log(`#${t.id} ${t.completed ? '[x]' : '[ ]'} ${t.title}`);
  }
}

async function addTodo(title: string) {
  const res = await fetch(`${API_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    console.error('Failed to add');
  }
}

async function markDone(id: number) {
  const res = await fetch(`${API_URL}/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true }),
  });
  if (!res.ok) console.error('Failed to update');
}

async function deleteTodo(id: number) {
  const res = await fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) console.error('Failed to delete');
}

async function main() {
  console.log('Todo CLI. Type "help" for commands.');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  printHelp();
  rl.setPrompt('> ');
  rl.prompt();
  rl.on('line', async (line: string) => {
    const [cmd, ...args] = line.trim().split(/\s+/);
    try {
      switch (cmd) {
        case 'list':
          await listTodos();
          break;
        case 'add':
          await addTodo(args.join(' '));
          break;
        case 'done':
          await markDone(Number(args[0]));
          break;
        case 'delete':
          await deleteTodo(Number(args[0]));
          break;
        case 'help':
          printHelp();
          break;
        case 'exit':
          rl.close();
          return;
        default:
          console.log('Unknown command');
      }
    } catch (e) {
      console.error('Error:', e);
    }
    rl.prompt();
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
