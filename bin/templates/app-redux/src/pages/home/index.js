import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Header from './components/Header'
import MainSection from './components/MainSection'
import * as TodoActions from 'app/actions'
import style from './style'

class App extends Component {
    render() {
        const { todos, actions } = this.props
        return (
            <div className="Home">
                <Header addTodo={actions.addTodo} />
                <MainSection todos={todos} actions={actions} />
                <Link to="/about" className="about">about</Link>
            </div>
        )
    }
}

App.propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
}

export default connect(
    (state) => {
        return state
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(TodoActions, dispatch)
        }
    }
)(App)
