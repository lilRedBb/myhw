
## Backend code
1. Refactor your API so that the list of todoItems is read from the `todoitems.json` JSON file in this repo, instead of the static list in Assignment 4
2. The entire JSON file should be read in along with all of the item details
3. Modify your POST method to serialize new items to a file.
4. When a new todo items is posted it is serialized and written to `todoitems.json` as a JSON object.
5. The written object will now be persisted, so next time you run the backend API the new todo item will be loaded and sent to the front end
6. Create a PUT method to modify items already in your list.  This will require a couple things:
   - Modify your `TodoItem class` to have a unique id field.  This will allow you to match up the edited item on the front end with the back end
   - You must only write the newly edited item to the `todoitems.json` file
  
## Frontend code
1. Add a PUT method to your frontend.  The PUT method will allow you to edit current items on your todo list and sync them back to the server.
   - In order to do this you will have to make the todo item into a form so and apply changes.  This will allow you to integrate a PUT method into   the edits