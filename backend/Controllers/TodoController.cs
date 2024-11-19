using backend.Model;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TodoController : ControllerBase
    {
        private static List<TodoItem> todoItems = LoadTodoItems();
        private static int nextId = LoadNextId();

        private static List<TodoItem> LoadTodoItems()
        {
            try
            {
                
                string jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "todolist.json");
                Console.WriteLine("Current Directory: " + Directory.GetCurrentDirectory());
                if (System.IO.File.Exists(jsonPath))
                {
                    string jsonContent = System.IO.File.ReadAllText(jsonPath);
                    return JsonSerializer.Deserialize<List<TodoItem>>(jsonContent) ?? new List<TodoItem>();
                }
                return new List<TodoItem>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading the JSON file: {ex.Message}");
                return new List<TodoItem>();
            }
        }

        private static int LoadNextId()
        {
            // Determine the next available ID based on current items
            return todoItems.Any() ? todoItems.Max(item => item.Id) + 1 : 1;
        }

        private void SaveTodoItems()
        {
            try
            {
                string jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "todolist.json");
                string jsonContent = JsonSerializer.Serialize(todoItems);
                System.IO.File.WriteAllText(jsonPath, jsonContent);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving to the JSON file: {ex.Message}");
            }
        }

        [HttpGet("getTodoItems")]
        public ActionResult<IEnumerable<TodoItem>> GetTodoItems([FromQuery] string? list = null)
        {
            if (string.IsNullOrEmpty(list))
                return Ok(todoItems);
            else
                return Ok(todoItems.Where(todo => todo.List == list).ToList());
        }

        [HttpPost("addTodoItem")]
        public ActionResult<TodoItem> AddTodoItem([FromBody] TodoItem newTodoItem)
        {
            newTodoItem.Id = nextId++; // Assign new ID and increment nextId
            todoItems.Add(newTodoItem);
            SaveTodoItems();
            return CreatedAtAction(nameof(GetTodoItems), new { id = newTodoItem.Id }, newTodoItem);
        }

        [HttpPut("updateTodoItem/{id}")]
        public IActionResult UpdateTodoItem(int id, [FromBody] TodoItem updatedItem)
        {
            var item = todoItems.FirstOrDefault(t => t.Id == id);
            if (item == null)
                return NotFound();

            item.Title = updatedItem.Title;
            item.Description = updatedItem.Description;
            item.DueDate = updatedItem.DueDate;
            item.List = updatedItem.List;

            SaveTodoItems();
            return NoContent();
        }
    }
}
