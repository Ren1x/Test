$(document).ready(() => {
	// ------------------ Переменные------------*

	// Блок с кнопками (выбирать какую информацию загружать)
	const $btnContainer = $("#btnContainer");

	// Главный блок, куда выводится таблица с данными
	const $tableContainer = $("#tableContainer");

	// Тело таблицы с загруженными данными
	const $dataTable = $("#dataTable");

	// Блок с информацией о выбранной ячейке таблицы
	// (выводится под таблицей)
	const $selectedCellInfo = $("#selectedCellInfo");

	// Полоса загрузки
	const $progressBar = $("#progressBar");

	// Сообщение об ошибке
	const $errorMessage = $("#errorMessage");

	// Загруженные данные с json
	let dataJson;
	// -----------------*

	// ----------------- Функции для создания доп. блока при клике на ячейку таблицы ---------*

	// Контейнер очищается и появляется
	const resetExtendedInfo = () => {
		$selectedCellInfo.empty();
		$selectedCellInfo.show(100);
	};

	// Создает блок с информацией о выбранной ячейке таблицы
	const addingExtendedInfo = info => {
		resetExtendedInfo();

		let extendedInfo = `<p>Выбран пользователь  <b>${info.firstName} ${
			info.lastName
		}</b></p>
					<p>Описание: </p>
					<div>${info.description}.</div>
					<br>
					<p>Адрес проживания: <b>${info.address.streetAddress}</b></p>
					<p>Город: <b>${info.address.city}</b></p>
					<p>Провинция/штат: <b>${info.address.state}</b></p>
					<p>Индекс: <b>${info.address.zip}</b></p>`;
		$selectedCellInfo.append(extendedInfo);
	};

	// Кликая на ячейки таблицы, фильтрует полученные json данные по email
	// (у всех разные) и отправляет выбранные данные в addingExtendedInfo
	const executeSelectCell = e => {
		dataJson.filter(data => {
			// Сверяем последнюю ячейку выбранной строки (т.е. email) с данные из json.email
			if (
				$(e.target)
					.parent()
					.children(":last")
					.text() === data.email
			) {
				addingExtendedInfo(data);
			}
		});
	};
	// -------------------*

	// ------------------- Функции для создания таблицы. Получает данные из json файла -----------*

	// Обрабатывает ошибки
	const error = e => {
		// Прячет полосу загрузки
		$progressBar.hide(200);

		// Очищает блок с ошибкой
		$errorMessage.children().empty();

		// Текст для блока с ошибкой
		$errorMessage.children("p").text(`Ошибка (${e.message}).`);

		// Показывает блок с ошибкой
		$errorMessage.show(400);

		//Делает кнопку активной
		enableBtn();

		// При ошибке меняется бэкграунд
		changeBgColor("#f77979ab");
	};

	// Делает кнопку активной
	const enableBtn = () => $btnContainer.children('input').removeClass('disabled');

	// Меняет цвет фона у body
	const changeBgColor = color => {
		$("body").css("background-color", color);
	};

	// Прячет полосу загрузки, показывает таблицу
	// Добавляет таблице стили
	const showTable = () => {
		$progressBar.hide(200);

		// Таблица центрируется, навигация не расползается
		$("#DataTables_Table_0").addClass("centeringTable");
		$("#DataTables_Table_0_wrapper")
			.children(":first")
			.addClass("navigateButtonsTable");
		$("#DataTables_Table_0_wrapper")
			.children(":last")
			.addClass("navigateButtonsTable");

		$tableContainer.show(200);

		// Меняется бэкграунд
		changeBgColor("#e4f5fc");
	};

	// Создается таблица с полученными даными
	const createTable = data => {
		$("table").DataTable({
			// Очищается при вызове
			destroy: true,

			// Получает данные
			data: data,

			// Формирует колонки по этому примеру
			columns: [
				{ data: "id" },
				{ data: "firstName" },
				{ data: "lastName" },
				{ data: "phone" },
				{ data: "email" }
			],

			// Опции отоброжения количества записей
			lengthMenu: [10, 15, 25, 50],

			//Длина записей по умолчанию
			iDisplayLength: 25,

			// Текст в таблице
			language: {
				lengthMenu: "Показать _MENU_ записей",
				search: "",
				sSearchPlaceholder: "Фильтр",
				infoEmpty: "с 0 до 0 из 0",
				info: "с _START_ до _END_ записей",
				infoFiltered: "(отфильтровано из _MAX_ записей)",
				zeroRecords: "Записи отсутствуют.",
				paginate: {
					first: "Первая",
					previous: "Пред.",
					next: "След.",
					last: "Последняя"
				}
			}
		});
	};

	// Запрашиваем json данные с сервера и передаем их в dataJson
	const getDataResponse = async url => {
		let response = await fetch(url);

		if (response.ok) {
			let jsonResponse = await response.json();
			return (dataJson = jsonResponse);
		}
	};

	// Обнуляет прошлые вызовы, если были
	const resetAddingStyleFromTable = () => {
		// Прячет и очищает блок с информацией по ячейке таблицы
		$selectedCellInfo.hide(100);
		$selectedCellInfo.empty();

		// Прячет сообщение об ошибке и контейнер с таблицей
		$errorMessage.hide(200);
		$tableContainer.hide(200);

		// Отображает полосу загрузки по центру
		//  (изначально display:none)
		$progressBar.css("display", "flex");
	};

	// Запускает цепочку получения информации и создания таблицы
	const executeTableLoad = url => {
		resetAddingStyleFromTable();

		getDataResponse(url)
			.then(data => createTable(data))
			.then(() => showTable())
			.then(() => enableBtn())
			.catch(e => error(e));
	};


	// Проверяем на какую кнопку нажали
	// и запускаем функцию executeTableLoad c соответствующим аргументом
	const checkBtnClicked = event => {
		// Если кнопка нажата и таблица еще не загружена, то кнопка не срабатывает.
		if($btnContainer.children('input').hasClass('disabled')) return false;

		// Добавляет класс неактивной кнопки.
		$(event.target).addClass('disabled');

		if (event.target.id === "btnSmall") {
			executeTableLoad(
				"http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}"
			);
		} else if (event.target.id === "btnBig") {
			executeTableLoad(
				"http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}"
			);
		}
	};
	// -----------------*


	$btnContainer.on('click', event => checkBtnClicked(event));
	$dataTable.on('click', event => executeSelectCell(event));
});