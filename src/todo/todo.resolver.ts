/* eslint-disable prettier/prettier */
import { Resolver, Query, Mutation, Args, ObjectType, Field, ID } from '@nestjs/graphql';

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
}

@Resolver(() => Todo)
export class TodoResolver {
  private todos: Todo[] = [];

  @Query(() => String)
  sayHello(): string {
    return 'GraphQL Server is running!';
  }

  @Query(() => [Todo], { name: 'todos' })
  getAllTodos(): Todo[] {
    return this.todos;
  }

  @Query(() => Todo, { nullable: true })
  getTodoById(@Args('id') id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  @Mutation(() => Todo)
  createTodo(
    @Args('title') title: string,
    @Args('description', { nullable: true }) description?: string,
  ): Todo {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
    };
    this.todos.push(newTodo);
    return newTodo;
  }
}