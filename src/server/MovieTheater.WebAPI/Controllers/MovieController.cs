using MediatR;
using Microsoft.AspNetCore.Mvc;
using MovieTheater.Business.Handlers.Movie;
using MovieTheater.Business.ViewModels.Movie;
using MovieTheater.Commands;
using MovieTheater.Core;
using MovieTheater.ViewModels;

namespace MovieTheater.WebAPI.Controllers
{
    /// <summary>
    /// Authen API Controller 
    /// </summary>
    /// <param name="mediator"></param>
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "v1")]

    public class MovieController(IMediator mediator) : ControllerBase
    {
        private readonly IMediator _mediator = mediator;
        /// <summary>
        /// Retrieves all movies.
        /// </summary>
        /// <returns>A collection of all orders.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<MovieViewModel>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllAsync()
        {
            var query = new MovieGetAllQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(MovieViewModel), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMovieById(Guid id)
        {
            var query = new MovieGetByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateMovieCommand command)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var movieId = await _mediator.Send(command);
                return Ok(new { Id = movieId, Message = "Movie created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(Guid id)
        {
            try
            {
                var result = await _mediator.Send(new DeleteMovieCommand(id));

                if (!result)
                    return NotFound(new { message = "Movie not found." });

                return Ok(new { message = "Movie deleted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                // Trường hợp logic không cho xoá (đã bán vé)
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Lỗi không xác định
                return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
            }
        }


        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateMovie(Guid id, [FromForm] UpdateMovieQuery command)
        {
            if (id != command.Id)
            {
                return BadRequest(new { message = "Movie ID mismatch." });
            }

            try
            {
                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound(new { message = "Movie not found." });
                }

                return Ok(new { message = "Movie updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }


        /// <summary>
        /// Search movies by keyword, director, actor, etc.
        /// </summary>
        [HttpPost("search")]
        [ProducesResponseType(typeof(PaginatedResult<MovieViewModel>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResult<MovieViewModel>>> SearchMovies([FromBody] MovieSearchQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
