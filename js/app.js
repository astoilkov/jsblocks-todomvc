(function () {
	'use strict';

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var App = blocks.Application();

	var Todo = App.Model({
		title: App.Property(),

		completed: App.Property(),

		editing: blocks.observable(),

		init: function () {
			var collection = this.collection();
			if (collection) {
				this.title.on('change', collection.save);
				this.completed.on('change', collection.save);
			}
		},

		toggleComplete: function () {
			this.completed(!this.completed());
		},

		edit: function (e) {
			this.lastValue = this.title();
			this.editing(true);
		},

		closeEdit: function () {
			this.editing(false);
		},

		handleAction: function (e) {
			if (e.which == ENTER_KEY) {
				this.editing(false);
			} else if (e.which == ESCAPE_KEY) {
				this.title(this.lastValue);
				this.editing(false);
			}
		}
	});

	var Todos = App.Collection(Todo, {
		remaining: blocks.observable(),

		init: function () {
			this
				.reset(JSON.parse(localStorage.getItem('todos-jsblocks')))
				.on('add remove', this.save)
				.updateRemaining();
		},

		toggleAll: function () {
			var complete = this.remaining() == 0 ? false : true;
			this.each(function (todo) {
				todo.completed(complete);
			});
		},

		clearCompleted: function () {
			this.removeAll(function (todo) {
				return todo.completed();
			});
		},

		save: function () {
			var result = [];

			blocks.each(this(), function (model) {
				result.push(model.dataItem());
			});

			localStorage.setItem('todos-jsblocks', JSON.stringify(result));

			this.updateRemaining();
		},

		updateRemaining: function () {
			this.remaining(this.reduce(function (memo, todo) {
				return todo.completed() ? memo : memo + 1;
			}, 0));
		}
	});

	App.View('Todos', {
		options: {
			route: blocks.route('{{filter}}').optional('filter')
		},

		filter: blocks.observable(),

		newTodo: Todo(),

		todos: Todos().extend('filter', function (value) {
			var mode = this.filter();
			return mode == 'active' ? !value.completed() :
				mode == 'completed' ? value.completed() :
				true;
		}),

		routed: function (params) {
			if (params.filter != 'active' && params.filter != 'completed') {
				params.filter = 'all';
			}
			this.filter(params.filter);
		},

		addTodo: function (e) {
			if (e.which == ENTER_KEY) {
				this.todos.push(this.newTodo);
				this.newTodo.reset();
			}
		}
	});

})();
