
const dragContainer = document.querySelector('.drag-container');
const boardContainer = document.
    querySelector('.kanban-demo .board-container');
const board = document.querySelector('.kanban-demo .kanban-body');
const colTemplate = document.querySelector('.board-column-template');
const itemTemplate = document.querySelector('.board-item-template');
const colGrids = [];
let first;

let colDragCounter = 0;
const boardGrid = new Muuri(board, {
  layoutDuration: 300,
  layoutEasing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
  layout: (grid, layoutId, items, width, height, callback) => {
    Muuri.defaultPacker.setOptions({horizontal: true});
    return Muuri.defaultPacker.createLayout(
        grid,
        layoutId,
        items,
        width,
        height,
        (layoutData) => {
          delete layoutData.styles;
          callback(layoutData);
        },
    );
  },
  dragEnabled: true,
  layoutOnResize: true,
  itemHiddenClass: 'muuri-item-hidden',
  dragAxis: 'x',
  dragSortHeuristics: {
    sortInterval: 0,
  },
  dragHandle: '.board-column-title',
  dragRelease: {
    duration: 300,
    esaing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
    useDragContainer: false,
  },
  dragAutoScroll: {
    targets: [{element: boardContainer, axis: Muuri.AutoScroller.AXIS_X}],
  },
});
document.addEventListener('DOMContentLoaded', async function() {
  boardGrid.on('dragInit', () => {
    if (!colDragCounter) {
      const width = boardGrid.getItems().
          reduce((a, item) => a + item.getWidth(), 0);
      board.style.width = `${width}px`;
      board.style.overflow = 'hidden';
    }
    ++colDragCounter;
  })
      .on('dragEnd', () => {
        --colDragCounter;
      })
      .on('dragReleaseEnd', () => {
        if (!colDragCounter) {
          board.style.width = '';
          board.style.overflow = '';
        }
      });

  const data = [
    {
        name : "To Do",
        type : "backlog1",
        items :[` <div class='cardName'>TEST</div>`],
  },
    {
        "name" : "In Progress",
        "type" : "todo2",
        "items" : [` <div class='cardName'>TEST</div>`],
  },
    {
        "name" : "Q/A",
        "type" : "working3",
        "items" :[` <div class='cardName'>TEST</div>`],
  },
    {
        "name" : "Done",
        "type" : "done4",
        "items" :[` <div class='cardName'>TEST</div>`],
    },
];
  data.forEach(({name, type, items}, i) => {
    addCol(name, type, (grid) => {
      items.reverse().forEach((item, i) => {
        type== 'backlog1'? first=grid:'';
        addColItem(grid, item);
      });
    });
  });

  // $('#task-tag option').each(function() {
  //   if (this.selected == '0') {
  //     $('#task-tag option').css('background', 'red');
  //   } else {
  //   }
  // });
  board.addEventListener('click', (e) => {
    if (e.target.matches('.board-item-action.delete')) {

    }
  });

  board.addEventListener('click', (e) => {
    if (e.target.matches('.board-item-action.redact')) {

    }
  });
});

/**
 *Function to changeStatus after drag
 *@param {number} id
 *@param {element} column
 */
function changeStatus(id, column) {
  const body = [id, column.replace(/\D/g, '')];
  fetch('/kanban/hunter/php/script.php', {
    method: 'POST',
    mode: 'same-origin',
    headers: {
      'function': 'changeStatus',
    },
    body: JSON.stringify(body),
  });
}

/**
 * function to change count in header
 */
function countColumn() {
  const columns = [
    '.backlog1',
    '.todo2',
    '.working3',
    '.done4',
  ];
  for (const i in columns) {
    if (Object.prototype.hasOwnProperty.call(columns, i)) {
      const countblock = $(columns[i]);
      const count= $(columns[i]).
          find('.muuri-item-shown').length;
      countblock.find('.countblock').html(count);
    }
  }
}



/**
 * Function to filtered by Channel/type/need/task/tag
 * @param {array} values
 * @param {array} groups
 */
function filterByAll(values, groups) {
  const filters=
  {
    'data-channel': [],
    'data-type': [],
    'data-need': [],
    'data-task': [],
    'data-tag': [],
    'data-archive': [],
  };

  for (const i in groups) {
    if (Object.prototype.hasOwnProperty.call(groups, i)) {
      filters[groups[i]].push(values[i]);
    }
  }

  distributer(filters);
}

/**
 * Function to hide all blocks
 * @param {Element} element
 */
function hide(element) {
  const itemElem = element.closest('.board-item');
  const item = colGrids.reduce((acc, grid) => acc || grid.
      getItem(itemElem), undefined);
  const grid = item.getGrid();
  grid.hide([item], {
    onFinish: () => {
      countColumn();
    },
  });
}

/**
 * Function to show all blocks
 * @param {Element} element
 */
function show(element) {
  const itemElem = element.closest('.board-item');
  const item = colGrids.reduce((acc, grid) => acc || grid.
      getItem(itemElem), undefined);
  const grid = item.getGrid();
  grid.show([item], {
    onFinish: () => {
      countColumn();
    },
  });
}

/**
   * Fucntion to add columnItems
   * @param {*} colGrid
   * @param {*} title
   * @param {*} onReady
   */
function addColItem(colGrid, title = '', onReady = null) {
  const itemElem = document.importNode(itemTemplate.
      content.children[0], true);
  const titleElem = itemElem.querySelector('.board-item-title');
  titleElem.innerHTML = title;
  colGrid.show(
      colGrid.add([itemElem], {
        active: false,
        index: 0,
        onFinish: (items) => {
          if (onReady) onReady(items[0]);
        },
      }),
  );
  countColumn();
  document.querySelector('.task-tag').onchange = function() {
    changeSelectColor();
  };
}

/**
 * test
 */
function changeSelectColor() {
  const select = document.querySelector('.task-tag');
  if (select.value == '0') {
    select.style.background = 'rgb(255, 102, 255)';
  } else if (select.value == '1') {
    select.style.background = 'rgb(255, 102, 178)';
  } else if (select.value == '2') {
    select.style.background = 'rgb(178, 102, 255)';
  } else {
    select.style.background = 'rgb(102, 102, 255)';
  }
}


/**
   * test
   * @param {*} title
   * @param {*} type
   * @param {*} onReady
   */
function addCol(title, type = 'todo', onReady = null) {
  const colElem = document.importNode(colTemplate.content.children[0], true);
  colElem.classList.add(type);
  colElem.querySelector('.board-column-title').innerHTML = title;
  boardGrid.show(
      boardGrid.add([colElem], {
        active: false,
      }),
      {
        onFinish: () => {
          const grid = new Muuri(colElem.
              querySelector('.board-column-items'), {
            items: '.board-item',
            showDuration: 300,
            layoutOnResize: true,
            showEasing: 'ease',
            hideDuration: 300,
            hideEasing: 'ease',
            layoutDuration: 300,
            itemHiddenClass: 'muuri-item-hidden',
            layoutEasing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
            dragEnabled: true,
            dragSort: () => colGrids,
            dragContainer: dragContainer,
            dragHandle: '.board-item-handle',
            dragRelease: {
              duration: 300,
              easing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
              useDragContainer: true,
            },
            dragPlaceholder: {
              enabled: true,
              createElement: (item) => item.getElement().cloneNode(true),
            },
            dragAutoScroll: {
              targets: (item) => {
                return [
                  window,
                  {
                    element: boardContainer,
                    priority: 1,
                    axis: Muuri.AutoScroller.AXIS_X,
                  },
                  {
                    element: item.getGrid().getElement().parentNode,
                    priority: 1,
                    axis: Muuri.AutoScroller.AXIS_Y,
                  },
                ];
              },
              sortDuringScroll: false,
            },
          })
              .on('dragInit', (item) => {
                const style = item.getElement().style;
                style.width = item.getWidth() + 'px';
                style.height = item.getHeight() + 'px';
              })
              .on('beforeSend', ({item, toGrid}) => {
                const style = item.getElement().style;
                style.width = toGrid._width - 20 + 'px';
                toGrid.refreshItems([item]);
              })
              .on('dragReleaseEnd', (item) => {
                const style = item.getElement().style;
                style.width = '';
                style.height = '';
                grid.refreshItems([item]);
              })
              .on('layoutEnd', () => {
                boardGrid.layout();
                countColumn();
              });

          colGrids.push(grid);

          if (onReady) onReady(grid);
        },
      },
  );
}

/**
 *Function to change status from reject to production
 @param {number} id
 */
function fromArchive(id) {
  Swal.fire({
    title: 'Вернуть Лида с архива?',
    icon: 'question',
    confirmButtonText: 'Вернуть',
    showCancelButton: true,
    cancelButtonText: 'Отмена',
  }).then((result) => {
    if (result.isConfirmed) {
      fetch('/kanban/hunter/php/script.php', {
        method: 'POST',
        mode: 'same-origin',
        headers: {
          'function': 'addNewtask',
        },
        body: JSON.stringify([id]),
      });
      hide(document.getElementById(`${id}`).closest('.board-item'));
    }
  });
}