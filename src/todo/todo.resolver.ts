/* eslint-disable prettier/prettier */
import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';

@ObjectType()
export class Todo {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  completed: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
class UpdateTodoInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  completed?: boolean;
}

@Resolver(() => Todo)
export class TodoResolver {
  private todos: Todo[] = [];
  private lastId = 1;

  private generateId(): string {
    this.lastId++;
    return this.lastId.toString();
  }

  @Query(() => String)
  sayHello(): string {
    return 'GraphQL Server is running!';
  }

  @Query(() => [Todo], { name: 'todos' })
  getAllTodos(): Todo[] {
    return this.todos;
  }

  @Query(() => Todo, { name: 'todo', nullable: true })
  getTodoById(@Args('id') id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  @Mutation(() => Todo)
  createTodo(
    @Args('title') title: string,
    @Args('description', { nullable: true }) description?: string,
  ): Todo {
    const newTodo: Todo = {
      id: this.generateId(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  @Mutation(() => Todo)
  updateTodo(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTodoInput,
  ): Todo {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      throw new NotFoundException(`Todo with ID ${id} not found`);

    }

    const updatedTodo = {
      ...this.todos[todoIndex],
      ...input,
      updatedAt: new Date(),
    };

    // Only update fields that were provided in the input
    if (input.title !== undefined) {
      updatedTodo.title = input.title;
    }
    if (input.description !== undefined) {
      updatedTodo.description = input.description;
    }
    if (input.completed !== undefined) {
      updatedTodo.completed = input.completed;
    }

    this.todos[todoIndex] = updatedTodo;
    return updatedTodo;
  }

  @Mutation(() => Boolean)
  deleteTodo(@Args('id', { type: () => ID }) id: string): boolean {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => String(todo.id) !== String(id));
    return this.todos.length !== initialLength;
  }

  @Mutation(() => Todo)
  toggleTodoStatus(@Args('id', { type: () => ID }) id: string): Todo {
    const todoIndex = this.todos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    const updatedTodo = {
      ...this.todos[todoIndex],
      completed: !this.todos[todoIndex].completed,
      updatedAt: new Date(),
    };

    this.todos[todoIndex] = updatedTodo;
    return updatedTodo;
  }
}