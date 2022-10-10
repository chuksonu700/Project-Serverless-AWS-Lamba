import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  lastKey: string
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    lastKey:'null'
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`this.state.newTodoName is ${this.state.newTodoName} and length is ${this.state.newTodoName.length}`)
    this.setState({ newTodoName: event.target.value })
    console.log(`this.state.newTodoName is ${this.state.newTodoName} and length is ${this.state.newTodoName.length}`)
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
  
    if (this.state.newTodoName.length <= 2) {
      alert("Error invalid Name: Must be At least Three (3) Characters long ")
    } else {
      try {
        const dueDate = this.calculateDueDate()
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
          name: this.state.newTodoName,
          dueDate
        })
        this.setState({
          todos: [...this.state.todos, newTodo],
          newTodoName: ''
        })
      } catch {
        alert('Todo creation failed')
      }  
    }
    
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }
  getMore = async ()=>{
    this.setState({
      lastKey:'null'
    })
    try {
      const freshTodo = await getTodos(this.props.auth.getIdToken(),this.state.lastKey)
      this.setState({
        todos:[...this.state.todos,freshTodo.items],
      })
      this.checkLastKey(freshTodo)
    } catch (e) {
      alert(`Failed to get more todos: ${(e as Error).message}`) 
    }
    


  }
  async componentDidMount() {
    try {
      const callGetTodos = await getTodos(this.props.auth.getIdToken(),this.state.lastKey)
      this.setState({
        todos:callGetTodos.items,
        loadingTodos: false
      })
      this.checkLastKey(callGetTodos)
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }
  async checkLastKey(callGetTodos:any){
    //checking for last Key
    if (callGetTodos.LastEvaluatedKey){
      this.setState({
        lastKey:callGetTodos.LastEvaluatedKey.todoId
      })
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row key={Math.random()*50505}>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered" key={Math.random()*888888}>
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <>
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
      { this.state.lastKey !== "null" ?
        <Grid>
        <Grid.Row key={(Math.random()*999999)}>
        <Grid.Column width={10} verticalAlign="middle">
          <Button color='blue' onClick={()=>this.getMore()}>
            View More ...
          </Button>
        </Grid.Column>
        </Grid.Row>
      </Grid>:''}
      </>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
