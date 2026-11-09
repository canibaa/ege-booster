(() => {
"use strict";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const API = window.EGELAB;
if (!API) { console.error("ЕГЭ LAB core API missing"); return; }
const DATA_KEY = "ege-booster-data-v1";
const subjects = ["Русский язык","Математика","Информатика"];
const officialBank = "https://fipi.ru/ege/otkrytyy-bank-zadaniy-ege";
const docs = "https://fipi.ru/ege/demoversii-specifikacii-kodifikatory";
const navigatorUrl = "https://fipi.ru/navigator-podgotovki/navigator-ege";
const maps = {
"Русский язык": [
["1","Информационная обработка текста","Выделяй ключевые слова и смысловые связи; не подменяй точный смысл догадкой.","Сопоставь исходный фрагмент и формулировку ответа; проверь, сохранены ли все существенные детали.","Найди предложение, которое точно передаёт мысль автора без добавления нового смысла."],
["2","Средства связи предложений","Определи, к какому слову или фрагменту отсылает местоимение, повтор, союз или наречие.","Прочитай соседние предложения; установи логическую связь; проверь грамматическую форму средства связи.","Определи, к чему относится указательное местоимение «это» в данном контексте."],
["3","Лексическое значение слова","Учитывай контекст, сочетаемость и оттенок значения; различай прямое и переносное употребление.","Замени слово нейтральным синонимом; проверь, сохраняется ли смысл всего предложения.","Объясни значение выделенного слова в контексте авторского рассуждения."],
["4","Орфоэпические нормы","Запоминай нормативное ударение; проверяй грамматическую форму слова.","Определи часть речи и форму; сверь ударение со словарной нормой.","Выбери слово с нормативным ударением."],
["5","Паронимы","Различай близкие по звучанию слова по значению и лексической сочетаемости.","Определи смысл контекста; подбери пароним; проверь словосочетание.","Исправь неверный выбор паронима в предложении."],
["6","Лексические нормы","Ищи плеоназм, тавтологию, неверную сочетаемость и речевую избыточность.","Найди смысловой повтор; проверь управление и сочетаемость; замени только ошибочный фрагмент.","Отредактируй предложение с нарушенной лексической сочетаемостью."],
["7","Морфологические нормы","Проверяй образование форм числительных, местоимений, существительных, прилагательных и глаголов.","Определи часть речи; назови требуемую форму; проверь окончание и исключения.","Исправь ошибку в образовании формы слова."],
["8","Синтаксические нормы","Следи за согласованием, управлением, однородными членами, причастными и деепричастными оборотами.","Найди грамматическую основу; определи конструкцию; проверь, кто выполняет действие.","Исправь предложение с ошибкой в построении сложной конструкции."],
["9","Правописание корней","Различай проверяемые, непроверяемые и чередующиеся гласные; учитывай значение и суффикс.","Определи тип корня; для проверяемого подбери форму; для чередующегося примени правило.","Выбери ряд слов с одной и той же орфограммой в корне."],
["10","Правописание приставок","Учитывай неизменяемые приставки, приставки на З/С, ПРЕ-/ПРИ- и И/Ы после приставок.","Выдели приставку; проверь следующую согласную или значение; учти исключения.","Объясни написание приставки в слове с близким по звучанию вариантом."],
["11","Суффиксы разных частей речи","Определи часть речи и производящую основу; проверь правило выбора суффикса.","Разбери слово по составу; найди условие выбора; проверь исключения.","Выбери слово с нужной гласной в суффиксе."],
["12","Личные окончания глаголов и суффиксы причастий","Определи спряжение по инфинитиву с учётом исключений; затем выбери окончание или суффикс.","Поставь глагол в неопределённую форму; определи спряжение; примени правило.","Образуй действительное причастие настоящего времени от заданного глагола."],
["13","Слитное, раздельное и дефисное написание","Определи часть речи, наличие зависимых слов, противопоставления и условия дефиса.","Проверь контекст; замени синонимом; задай вопрос; проверь устойчивое сочетание.","Выбери вариант написания НЕ или НИ в контексте."],
["14","Н и НН","Различай отымённые прилагательные, отглагольные прилагательные и причастия; учитывай краткую форму.","Определи часть речи; найди приставку, зависимое слово, вид глагола и суффикс.","Объясни написание Н/НН в причастии с зависимым словом."],
["15","Правописание НЕ и НИ","Учитывай часть речи, противопоставление, зависимые слова и усилительные конструкции.","Определи часть речи; проверь возможность замены синонимом; найди противопоставление.","Выбери правильное написание НЕ в нескольких контекстах."],
["16","Пунктуация при однородных членах","Проверь одиночные и повторяющиеся союзы, обобщающие слова и границы однородного ряда.","Найди однородные члены; определи союз; проверь наличие обобщающего слова.","Расставь знаки в предложении с обобщающим словом."],
["17","Обособленные определения и обстоятельства","Причастный оборот после определяемого слова обычно обособляется; деепричастный оборот выделяется.","Найди оборот; установи его позицию и значение; проверь исключения.","Расставь запятые при причастном и деепричастном оборотах."],
["18","Вводные слова и обращения","Отличай вводные слова от членов предложения; обращение не является подлежащим.","Убери слово мысленно; задай синтаксический вопрос; проверь интонацию и значение.","Определи, где выделяется вводное слово, а где оно является членом предложения."],
["19","Сложное предложение","Найди основы, тип связи и границы частей; учитывай стык союзов и общие элементы.","Построй схему; проверь подчинение, сочинение и бессоюзную связь.","Расставь знаки на стыке двух союзов."],
["20","Сложное предложение с разными видами связи","Сочетай правила сочинительной, подчинительной и бессоюзной связи.","Выдели основы; составь схему; последовательно проверь каждую границу.","Составь схему предложения с тремя видами связи."],
["21","Пунктуационный анализ","Проверяй все знаки по основаниям: грамматическая структура, обороты, вводность, однородность.","Для каждого знака назови правило; не ориентируйся только на паузу.","Выбери позиции, в которых нужна запятая по одному правилу."],
["22","Функционально-смысловые типы речи","Различай повествование, описание и рассуждение; анализируй роль фрагмента в тексте.","Определи, что делает автор: сообщает события, описывает признаки или доказывает тезис.","Определи тип речи фрагмента и обоснуй выбор."],
["23","Логико-смысловые отношения","Устанавливай причину, следствие, противопоставление, пояснение и временную последовательность.","Сформулируй связь между соседними предложениями одним коротким союзом.","Определи, какое отношение связывает два предложения текста."],
["24","Лексический анализ текста","Учитывай контекстуальные синонимы, антонимы, фразеологизмы, термины и стилистическую окраску.","Найди нужные слова; проверь значение именно в этом контексте.","Найди контекстуальные антонимы в указанном фрагменте."],
["25","Средства связи и выразительности","Различай тропы и фигуры речи; объясняй их функцию, а не только называй термин.","Найди языковой маркер; определи перенос или синтаксический приём; сформулируй эффект.","Определи, какой приём создаёт образность фрагмента."],
["26","Анализ содержания текста","Подтверждай каждый вывод конкретным фрагментом; не приписывай автору невыраженную позицию.","Сформулируй тезис; найди подтверждение; проверь, не противоречит ли ответ тексту.","Выбери утверждения, соответствующие содержанию текста."],
["27","Сочинение по прочитанному тексту","Сформулируй проблему, позицию автора, комментарий с двумя примерами и пояснениями, связь между ними и собственное отношение с обоснованием.","Проверь критерии содержания и речи; избегай пересказа вместо комментария; соблюдай объём и логику.","Напиши комментарий к проблеме, показав роль двух примеров-иллюстраций."]
],
"Математика": [
["1","Планиметрия","Теоремы о треугольниках, окружностях, площадях и подобии.","Сделай чертёж; выдели известные элементы; выбери теорему; проверь геометрические ограничения.","Реши типовую задачу №1 по демоверсии и проверь оформление ответа."],
["2","Векторы","Координаты вектора, длина, скалярное произведение и угол.","Найди координаты; используй формулу длины или скалярного произведения.","Реши типовую задачу №2 по демоверсии и проверь оформление ответа."],
["3","Стереометрия","Призмы, пирамиды, цилиндры, конусы, сферы и сечения.","Сделай пространственный чертёж; выдели сечение; сведи к планиметрии.","Реши типовую задачу №3 по демоверсии и проверь оформление ответа."],
["4","Простая вероятность","Классическая вероятность P(A)=m/n для равновозможных исходов.","Определи все исходы; посчитай благоприятные; проверь равновозможность.","Реши типовую задачу №4 по демоверсии и проверь оформление ответа."],
["5","Теоремы вероятностей","Сложение, умножение, независимость и формула полной вероятности.","Разбей событие на случаи; построй дерево исходов; проверь независимость.","Реши типовую задачу №5 по демоверсии и проверь оформление ответа."],
["6","Случайные величины","E(X)=Σxᵢpᵢ; D(X)=E(X²)−(E(X))².","Составь таблицу распределения; проверь сумму вероятностей; вычисли ожидание и дисперсию.","Реши типовую задачу №6 по демоверсии и проверь оформление ответа."],
["7","Простейшие уравнения","Степенные, показательные, логарифмические и тригонометрические уравнения.","Запиши ОДЗ; преобразуй равносильно; проверь корни.","Реши типовую задачу №7 по демоверсии и проверь оформление ответа."],
["8","Вычисления и преобразования","Степени, корни, дроби, логарифмы и тригонометрические выражения.","Разбей выражение на части; преобразуй последовательно; проверь обратным действием.","Реши типовую задачу №8 по демоверсии и проверь оформление ответа."],
["9","Производная и первообразная","Таблица производных, правила дифференцирования, монотонность и первообразная.","Найди производную; исследуй знак; примени нужное свойство.","Реши типовую задачу №9 по демоверсии и проверь оформление ответа."],
["10","Прикладные задачи","Модели физических и геометрических процессов, единицы измерения.","Выдели данные; запиши зависимость; проверь размерность.","Реши типовую задачу №10 по демоверсии и проверь оформление ответа."],
["11","Текстовые задачи","Движение, работа, смеси и другие зависимости величин.","Введи переменную; составь уравнение; проверь смысл корня.","Реши типовую задачу №11 по демоверсии и проверь оформление ответа."],
["12","Графики функций","Нули, пересечения, области определения и число решений.","Сопоставь график и формулу; найди нужные пересечения и интервалы.","Реши типовую задачу №12 по демоверсии и проверь оформление ответа."],
["13","Личные и семейные финансы","Вклады, кредиты, проценты и изменение остатка долга.","Составь таблицу по периодам; запиши формулу остатка; проверь порядок начисления.","Реши типовую задачу №13 по демоверсии и проверь оформление ответа."],
["14","Уравнение с отбором корней","Равносильность преобразований, ОДЗ и отбор на промежутке.","Реши уравнение; выпиши все корни; проверь ограничения и условие отбора.","Реши типовую задачу №14 по демоверсии и проверь оформление ответа."],
["15","Стереометрическая задача","Доказательство и вычисления в пространстве, углы и расстояния.","Сделай чертёж; обоснуй перпендикулярность; вычисли искомое.","Реши типовую задачу №15 по демоверсии и проверь оформление ответа."],
["16","Неравенства","Метод интервалов, ОДЗ и знаки выражений.","Перенеси всё в одну сторону; найди критические точки; проверь границы.","Реши типовую задачу №16 по демоверсии и проверь оформление ответа."],
["17","Математическое моделирование","Построение модели реальной ситуации и оптимизация с помощью производной.","Введи переменную; составь функцию и ограничения; найди экстремум и интерпретируй ответ.","Реши типовую задачу №17 по демоверсии и проверь оформление ответа."],
["18","Планиметрическая задача","Сложные конфигурации, окружности, подобие и тригонометрия.","Сделай вспомогательное построение; докажи отношения; вычисли ответ.","Реши типовую задачу №18 по демоверсии и проверь оформление ответа."],
["19","Задача с параметром","Число корней в зависимости от параметра, графики и критические значения.","Найди границы случаев; исследуй интервалы; отдельно проверь граничные значения.","Реши типовую задачу №19 по демоверсии и проверь оформление ответа."],
["20","Числа и их свойства","Делимость, остатки, оценки и доказательство утверждений о целых числах.","Разбей на случаи; докажи необходимость и достаточность; проверь полноту.","Реши типовую задачу №20 по демоверсии и проверь оформление ответа."]
],
"Информатика": [
["1","Передача и кодирование информации","Объём равен числу символов, умноженному на информационный вес; различай мощность алфавита и длину сообщения.","Определи алфавит; найди бит на символ; учти кодирование и единицы измерения.","Вычисли объём сообщения при заданной мощности алфавита."],
["2","Логические выражения","Используй таблицы истинности и приоритет НЕ, И, ИЛИ; проверяй импликацию.","Выпиши наборы переменных; вычисли выражение по столбцам; проверь все строки.","Построй таблицу истинности выражения с тремя переменными."],
["3","Базы данных и таблицы","Фильтруй строки по условию; различай AND/OR и включение границ диапазона.","Переведи условие в логическое выражение; проверь каждую строку; посчитай подходящие записи.","Найди число строк, удовлетворяющих составному условию."],
["4","Кодирование и декодирование","Проверяй префиксность кодов и однозначность декодирования.","Построй дерево кодов; последовательно декодируй сообщение; проверь единственность.","Определи, можно ли однозначно декодировать последовательность."],
["5","Исполнитель и алгоритм","Моделируй команды исполнителя; отслеживай состояние после каждой команды.","Запиши начальное состояние; выполни команды по порядку; проверь условие остановки.","Определи результат работы линейного алгоритма исполнителя."],
["6","Анализ алгоритмов","Считай изменения переменных и условные переходы; используй таблицу трассировки.","Заполни таблицу по итерациям; не пропускай проверку условия цикла.","Найди итоговое значение переменной после цикла."],
["7","Компьютерные сети и объём данных","Учитывай пропускную способность, время, объём и перевод бит/байт.","Приведи единицы; используй V=vt; проверь, в каких единицах задана скорость.","Вычисли время передачи файла по каналу связи."],
["8","Комбинаторика и перебор","Применяй правило произведения, размещения и систематический перебор.","Определи число позиций и допустимые символы; исключи запрещённые случаи.","Посчитай количество кодов фиксированной длины."],
["9","Электронные таблицы","Понимай относительные и абсолютные ссылки, формулы и диапазоны.","Разбери формулу; проследи изменение ссылок при копировании; проверь диапазон.","Определи значение формулы после копирования ячейки."],
["10","Маски подсетей (тема проекта 2027)","IP-адрес и маска задают сеть; сетевой адрес получается побитовой операцией AND.","Переведи октеты в двоичный вид; примени маску; сравни сетевые части адресов.","Определи, принадлежат ли два адреса одной подсети."],
["11","Информационный поиск и системы счисления","Соблюдай приоритет операций и корректно переводить числа между основаниями.","Разбери выражение; переведи числа в одну систему; вычисли и проверь результат.","Вычисли значение выражения с числами в разных системах."],
["12","Исполнение алгоритма и циклы","Составляй трассировку, учитывай вложенные циклы и границы range.","Определи число итераций каждого цикла; запиши вклад итераций; сложи результаты.","Найди количество выполнений команды во вложенных циклах."],
["13","Анализ работы алгоритма (тема проекта 2027)","Изучай трассу алгоритма, входные данные и условия; отличай состояние до и после шага.","Заполни таблицу состояний; проверь ветвления; найди момент изменения результата.","Определи, при каком входе алгоритм выдаёт заданный результат."],
["14","Кодирование чисел и системы счисления","Переводи числа через разложение по степеням основания; контролируй разрядность.","Запиши позиционную сумму; выполни перевод; проверь обратным преобразованием.","Найди количество единиц в двоичной записи числа."],
["15","Логические выражения и маски","Используй преобразования логики и перебор допустимых значений; в сетевых задачах — двоичную маску.","Укажи диапазон переменных; построй выражение; проверь граничные случаи.","Найди минимальное значение переменной, при котором выражение истинно."],
["16","Рекурсивные алгоритмы","Понимай базовый случай и стек вызовов; прослеживай возврат значений.","Распиши вызовы сверху вниз; затем вычисли возвраты снизу вверх.","Определи результат рекурсивной функции."],
["17","Обработка последовательностей","Используй один проход по данным, аккуратные условия и накопители.","Определи критерий элемента; обновляй счётчики; проверь крайние случаи.","Найди максимальную длину серии по условию."],
["18","Динамическое программирование и таблицы","Формализуй состояние, переход и начальные значения; не путай индексы.","Определи dp-состояние; запиши переход; заполни таблицу в правильном порядке.","Найди значение последней ячейки таблицы динамики."],
["19","Теория игр: выигрыш за один ход","Определи терминальные позиции и ходы, ведущие к победе.","Перечисли допустимые переходы; отметь выигрышные и проигрышные состояния.","Найди минимальное значение, при котором игрок выигрывает первым ходом."],
["20","Теория игр: выигрыш за несколько ходов","Различай стратегии первого и второго игрока; анализируй обязательность выигрыша.","Построй рекуррентную классификацию позиций; проверь все разрешённые ходы.","Определи диапазон параметров для гарантированной победы."],
["21","Теория игр: стратегия","Проверяй, может ли игрок обеспечить победу при любом ответе соперника.","Разбери выигрышные слои; докажи стратегию для всех ответов противника.","Докажи, что стратегия игрока гарантирует победу не позднее заданного хода."],
["22","Многопроцессорные системы и расписания","Учитывай зависимости между работами и доступность исполнителей.","Построй граф зависимостей; найди критический путь; проверь загрузку ресурсов.","Определи минимальное время выполнения набора работ."],
["23","Исполнитель и перебор программ","Перебирай допустимые параметры и команды; исключай дубли и неверные границы.","Запиши цикл перебора; проверь условие; сравни число решений.","Посчитай количество программ, удовлетворяющих ограничению."],
["24","Обработка текстовых файлов","Используй поиск, подсчёт символов и аккуратную обработку строк.","Определи шаблон; учти регистр и границы; проверь тестовый фрагмент.","Найди максимальное число подряд идущих символов по условию."],
["25","Обработка целых чисел и делители","Используй перебор до корня числа, проверку делимости и оптимизацию.","Ограничь диапазон; проверяй пары делителей; учитывай квадратный корень.","Найди все числа в диапазоне с заданным количеством делителей."],
["26","Обработка данных и оптимизация","Своди условие к сортировке, жадному выбору или динамике; доказывай оптимальность.","Определи цель; отсортируй по ключу; докажи, почему локальный выбор корректен.","Найди максимальное число объектов при заданном ограничении."],
["27","Сложная задача на программирование","Выбери эффективный алгоритм; оцени сложность; проверь крайние случаи и формат ответа.","Сначала докажи идею; оцени O(n) или O(n log n); реализуй; проверь тесты и границы.","Разработай алгоритм обработки большого массива с требуемой сложностью."]
]};
const state = {subject:"Русский язык",number:"1",exam:null,timer:null,seconds:0,answers:[],planDate:""};
function getData(){return API.getData();}
function persist(){API.saveData();}
function addPanel(){
 const nav=$(".bottom-nav");
 const add=(id,label,icon)=>{const b=document.createElement("button");b.className="nav-item";b.id="nav-"+id;b.dataset.tab=id;b.type="button";b.innerHTML='<span class="nav-icon">'+icon+'</span><span>'+label+'</span>';nav.append(b);b.addEventListener("click",()=>setTab(id));};
 add("catalog","Каталог","▦");add("exam","Экзамен","◷");add("plan","План","✓");
 const main=$("#main-content");
 const panel=(id,html)=>{const s=document.createElement("section");s.className="tab-panel study-panel";s.id="panel-"+id;s.hidden=true;s.innerHTML=html;main.append(s);};
 panel("catalog",'<div class="page-intro"><p class="eyebrow">КАРТА ЕГЭ 2027</p><h2>Каталог заданий</h2><p>Все номера по трём предметам, краткая теория и алгоритм решения. Для официальных формулировок и полного открытого банка переходи на ФИПИ.</p></div><div class="catalog-tools"><label>Предмет<select id="catalog-subject"><option>Русский язык</option><option>Математика</option><option>Информатика</option></select></label><label>Номер задания<select id="catalog-number"></select></label><input id="catalog-search" type="search" placeholder="Поиск по темам и правилам"></div><div id="catalog-grid" class="catalog-grid"></div><div id="catalog-detail" class="catalog-detail"></div><div class="official-links"><a href="'+docs+'" target="_blank" rel="noopener">Демоверсии и кодификаторы ФИПИ ↗</a><a href="'+officialBank+'" target="_blank" rel="noopener">Открытый банк заданий ФИПИ ↗</a><a href="'+navigatorUrl+'" target="_blank" rel="noopener">Навигатор подготовки ФИПИ ↗</a></div><p class="form-hint">Карта построена по проектам структуры ЕГЭ-2027. Проектные документы могут быть уточнены; проверяй актуальную спецификацию. Теория и примеры в ЕГЭ LAB — авторские учебные материалы, не копии банка ФИПИ.</p>');
 panel("exam",'<div class="page-intro"><p class="eyebrow">КОНТРОЛЬ ЗНАНИЙ</p><h2>Экзаменационный режим</h2><p>Таймер, задания без подсказок и итоговый разбор. Это диагностическая тренировка на доступном банке сайта, а не полный официальный вариант КИМ.</p></div><div class="exam-setup" id="exam-setup"><label>Предмет<select id="exam-subject"><option>Русский язык</option><option>Математика</option><option>Информатика</option></select></label><label>Число заданий<select id="exam-count"><option value="10">10 заданий</option><option value="15">15 заданий</option><option value="all">Все доступные</option></select></label><button class="primary-button" id="exam-start">Начать экзамен</button><p class="form-hint">Время диагностического варианта — 45 минут. Балл отображается как процент правильных ответов, не как официальный первичный балл ЕГЭ.</p></div><div id="exam-live" hidden></div><div id="exam-result"></div>');
 panel("plan",'<div class="page-intro"><p class="eyebrow">МАРШРУТ ДО ЭКЗАМЕНА</p><h2>План подготовки</h2><p>План обновляется по твоим ответам: больше времени отдаётся темам с частыми ошибками и низкой точностью.</p></div><div id="plan-summary" class="plan-summary"></div><div id="plan-list" class="plan-list"></div><button class="secondary-button" id="plan-refresh">Пересчитать план</button>');
}
function setTab(id){
 document.querySelectorAll(".nav-item").forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle("active",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
 document.querySelectorAll(".tab-panel").forEach(p=>{const on=p.id==="panel-"+id;p.hidden=!on;p.classList.toggle("active",on);});
 window.scrollTo({top:0,behavior:"smooth"});
 if(id==="catalog")renderCatalog();if(id==="plan")renderPlan();if(id==="progress")renderAnalytics();
}
function renderCatalog(){
 const subject=$("#catalog-subject").value;const rows=maps[subject];const number=$("#catalog-number");const search=$("#catalog-search").value.trim().toLocaleLowerCase("ru");
 const current=rows.find(x=>x[0]===number.value)||rows[0];
 number.innerHTML=rows.map(x=>'<option value="'+x[0]+'">№ '+x[0]+' — '+esc(x[1])+'</option>').join("");number.value=current[0];
 const filtered=rows.filter(x=>!search||x.join(" ").toLocaleLowerCase("ru").includes(search));
 $("#catalog-grid").innerHTML=filtered.map(x=>'<button class="catalog-item '+(x[0]===current[0]?"selected":"")+'" data-catalog-num="'+x[0]+'"><b>№ '+x[0]+'</b><span>'+esc(x[1])+'</span></button>').join("")||'<div class="empty-state">Ничего не найдено.</div>';
 $("#catalog-detail").innerHTML='<div class="catalog-detail-top"><span>'+esc(subject.toUpperCase())+'</span><b>ЗАДАНИЕ № '+current[0]+'</b></div><h3>'+esc(current[1])+'</h3><h4>Что нужно знать</h4><p>'+esc(current[2])+'</p><h4>Алгоритм решения</h4><p>'+esc(current[3])+'</p><h4>Тип практики</h4><p>'+esc(current[4])+'</p><div class="catalog-actions"><a href="'+officialBank+'" target="_blank" rel="noopener">Открыть официальный банк ФИПИ ↗</a><button class="secondary-button" id="catalog-practice">Тренировать тему на сайте</button></div>';
 $("#catalog-grid").querySelectorAll("[data-catalog-num]").forEach(b=>b.addEventListener("click",()=>{number.value=b.dataset.catalogNum;renderCatalog();}));
}
function renderPlan(){
 const d=getData(),answers=d.answers||[],errors=d.errors||[];
 const stats=subjects.map(subject=>{const a=answers.filter(x=>x.subject===subject);return {subject,total:a.length,correct:a.filter(x=>x.correct).length,pct:a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):null};});
 const weak=[...(d.topics||[])].sort((a,b)=>(Number(a.mastery)||0)-(Number(b.mastery)||0));
 const errorTopics=errors.reduce((m,e)=>{const k=e.subject+"|"+e.topic;m[k]=(m[k]||0)+1;return m;},{});
 const mostErrors=Object.entries(errorTopics).sort((a,b)=>b[1]-a[1]).slice(0,3);
 const suggestions=[];
 if(mostErrors.length)mostErrors.forEach(([k,n])=>{const [subject,topic]=k.split("|");suggestions.push({subject,topic,why:n+" ошибок в журнале",time:"20 минут"});});
 weak.slice(0,3).forEach(t=>{if(!suggestions.some(x=>x.subject===t.subject&&x.topic===t.title))suggestions.push({subject:t.subject,topic:t.title,why:"освоение "+(Number(t.mastery)||0)+"%",time:"15 минут"});});
 stats.filter(s=>s.pct===null||s.pct<70).forEach(s=>{if(!suggestions.some(x=>x.subject===s.subject))suggestions.push({subject:s.subject,topic:"Диагностика базовых навыков",why:s.pct===null?"ещё нет статистики":"точность "+s.pct+"%",time:"20 минут"});});
 const chosen=suggestions.slice(0,5);
 const date=new Date().toISOString().slice(0,10);
 if(!d.studyPlan||d.studyPlan.date!==date)d.studyPlan={date,done:[]};if(!Array.isArray(d.studyPlan.done))d.studyPlan.done=[];
 $("#plan-summary").innerHTML='<strong>План на '+new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long"})+'</strong><p>Предметы: '+stats.map(s=>esc(s.subject.replace(" язык",""))+" — "+(s.pct===null?"нет данных":s.pct+"%")).join(" · ")+'</p><p>Рекомендация: сначала разбирай повторяющиеся ошибки, затем решай задания на время.</p>';
 $("#plan-list").innerHTML=chosen.map((x,i)=>'<div class="plan-item"><label><input type="checkbox" data-plan-index="'+i+'" '+(d.studyPlan.done.includes(i)?"checked":"")+'><span><b>'+esc(x.subject)+' · '+esc(x.topic)+'</b><small>'+esc(x.why)+' · '+x.time+'</small></span></label><button type="button" class="secondary-button" data-practice-subject="'+esc(x.subject)+'" data-practice-topic="'+esc(x.topic)+'">Повторить</button></div>').join("")||'<div class="empty-state">Пока мало данных. Реши несколько заданий — план станет персональнее.</div>';
 $("#plan-list").querySelectorAll("[data-plan-index]").forEach(c=>c.addEventListener("change",()=>{const n=Number(c.dataset.planIndex);d.studyPlan.done=d.studyPlan.done.filter(x=>x!==n);if(c.checked)d.studyPlan.done.push(n);persist();}));
 $("#plan-list").querySelectorAll("[data-practice-subject]").forEach(b=>b.addEventListener("click",()=>startAdaptivePractice(b.dataset.practiceSubject,b.dataset.practiceTopic)));
}

function startAdaptivePractice(subject,topic){
 const d=getData(),all=[...API.getQuestions(),...API.getDailyQuestions()];
 const key=String(topic||"").toLocaleLowerCase("ru").split(/[ ·,]/)[0];
 let pool=all.filter(q=>q.subject===subject&&String(q.topic).toLocaleLowerCase("ru").includes(key));
 if(pool.length<2)pool=all.filter(q=>q.subject===subject);
 const seen=new Set();pool=pool.filter(q=>!seen.has(q.id)&&seen.add(q.id));
 if(!pool.length){window.open(officialBank,"_blank","noopener");return;}
 const host=$("#adaptive-practice")||document.createElement("div");host.id="adaptive-practice";$("#plan-list").after(host);
 let index=0,correct=0;
 function show(){const q=pool[index];host.innerHTML='<article class="catalog-detail"><div class="catalog-detail-top"><span>АДАПТИВНАЯ ПРАКТИКА</span><b>'+(index+1)+' / '+pool.length+'</b></div><h3>'+esc(topic)+'</h3><p>'+esc(q.q).replace(/\n/g,"<br>")+'</p><div class="exam-options">'+q.options.map((o,j)=>'<label><input type="radio" name="adaptive-choice" value="'+j+'"><span>'+esc(o)+'</span></label>').join("")+'</div><button class="primary-button" id="adaptive-check">Проверить</button><div id="adaptive-feedback"></div></article>';
 $("#adaptive-check").addEventListener("click",()=>{const chosen=host.querySelector('input[name="adaptive-choice"]:checked');if(!chosen)return;const ok=Number(chosen.value)===q.answer;if(ok)correct++;d.answers.push({id:"adaptive-"+q.id+"-"+Date.now(),subject:q.subject,topic:q.topic,correct:ok,date:new Date().toISOString().slice(0,10)});let t=d.topics.find(x=>x.subject===q.subject&&x.title===q.topic);if(!t){t={id:"adaptive-"+q.id,subject:q.subject,title:q.topic,mastery:ok?55:40,errors:ok?0:1};d.topics.push(t);}else{t.mastery=Math.max(0,Math.min(100,(Number(t.mastery)||0)+(ok?3:-5)));if(!ok)t.errors=(Number(t.errors)||0)+1;}if(!ok)d.errors.push({id:"adaptive-error-"+Date.now(),subject:q.subject,topic:q.topic,task:"",reason:"Повторение слабой темы",comment:q.q+" Правильный ответ: "+q.options[q.answer],date:new Date().toLocaleDateString("ru-RU")});API.saveData();API.renderAll();$("#adaptive-feedback").innerHTML='<div class="daily-explanation '+(ok?"good":"bad")+'"><b>'+(ok?"Верно":"Ошибка")+'</b><p>'+esc(q.explain)+'</p><button class="secondary-button" id="adaptive-next">'+(index===pool.length-1?"Завершить":"Следующее задание")+'</button></div>';$("#adaptive-check").disabled=true;$("#adaptive-next").addEventListener("click",()=>{index++;if(index>=pool.length){host.innerHTML='<div class="catalog-detail"><h3>Повторение завершено</h3><p>'+correct+' из '+pool.length+' верно. Результат сохранён.</p></div>';renderPlan();renderAnalytics();}else show();});});}
 show();host.scrollIntoView({behavior:"smooth",block:"start"});
}


function renderAnalytics(){
 const d=getData(),answers=d.answers||[];let host=$("#advanced-analytics");
 if(!host){host=document.createElement("section");host.id="advanced-analytics";host.className="analytics-panel";$("#panel-progress .stats-grid").after(host);}
 const groups={};answers.forEach(a=>{const k=a.subject+"|"+a.topic;groups[k]??={subject:a.subject,topic:a.topic,total:0,correct:0};groups[k].total++;if(a.correct)groups[k].correct++;});
 const rows=Object.values(groups).sort((a,b)=>a.correct/Math.max(1,a.total)-b.correct/Math.max(1,b.total));
 host.innerHTML='<div class="section-heading"><div><p class="eyebrow">АНАЛИТИКА ПО ТЕМАМ</p><h2>Где теряются баллы</h2></div></div>'+(rows.length?rows.map(x=>{const p=Math.round(x.correct/x.total*100);return '<article class="analytics-row"><div><b>'+esc(x.subject)+' · '+esc(x.topic)+'</b><small>'+x.correct+' / '+x.total+' верно</small></div><strong>'+p+'%</strong><div class="subject-track"><span style="width:'+p+'%"></span></div></article>';}).join(""):'<p class="form-hint">Реши задания, чтобы появилась статистика по темам.</p>');
}

function startExam(){
 const subject=$("#exam-subject").value;let pool=[...API.getQuestions(),...API.getDailyQuestions()].filter(q=>q.subject===subject);
 pool=pool.filter((q,i,a)=>a.findIndex(x=>x.id===q.id)===i);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const wanted=$("#exam-count").value==="all"?pool.length:Number($("#exam-count").value);
 pool=pool.slice(0,Math.min(wanted,pool.length));
 if(!pool.length){$("#exam-live").innerHTML='<div class="empty-state">Нет заданий для этого предмета.</div>';return;}
 state.exam={subject,pool,answers:Array(pool.length).fill(null),started:Date.now()};
 state.seconds=45*60;$("#exam-setup").hidden=true;$("#exam-result").innerHTML="";$("#exam-live").hidden=false;
 renderExam();
 clearInterval(state.timer);state.timer=setInterval(()=>{state.seconds--;const t=$("#exam-clock");if(t)t.textContent=Math.floor(state.seconds/60)+":"+String(state.seconds%60).padStart(2,"0");if(state.seconds<=0)finishExam(true);},1000);
}
function renderExam(){
 const ex=state.exam;if(!ex)return;
 $("#exam-live").innerHTML='<div class="exam-bar"><b>'+esc(ex.subject)+'</b><strong id="exam-clock">45:00</strong><span>'+ex.answers.filter(x=>x!==null).length+' / '+ex.pool.length+' отвечено</span></div><div class="exam-questions">'+ex.pool.map((q,i)=>'<article class="exam-question"><small>ЗАДАНИЕ '+(i+1)+' · '+esc(q.topic)+'</small><h3>'+esc(q.q).replace(/\n/g,"<br>")+'</h3><div class="exam-options">'+q.options.map((o,j)=>'<label><input type="radio" name="exam-'+i+'" value="'+j+'" '+(ex.answers[i]===j?"checked":"")+'><span>'+esc(o)+'</span></label>').join("")+'</div></article>').join("")+'</div><button class="primary-button" id="exam-submit">Завершить и проверить</button>';
 $("#exam-live").querySelectorAll("input[type=radio]").forEach(el=>el.addEventListener("change",()=>{const parts=el.name.split("-");ex.answers[Number(parts[1])]=Number(el.value);$("#exam-clock").parentElement.querySelector("span").textContent=ex.answers.filter(x=>x!==null).length+" / "+ex.pool.length+" отвечено";}));
 $("#exam-submit").addEventListener("click",()=>finishExam(false));
}
function finishExam(timeout){
 clearInterval(state.timer);const ex=state.exam;if(!ex)return;
 let correct=0;const d=getData();
 ex.pool.forEach((q,i)=>{const ok=ex.answers[i]===q.answer;if(ok)correct++;d.answers.push({id:"exam-"+q.id+"-"+Date.now()+"-"+i,subject:q.subject,topic:q.topic,correct:ok,date:new Date().toISOString().slice(0,10)});let topic=d.topics.find(t=>t.subject===q.subject&&t.title===q.topic);if(!topic){topic={id:"exam-"+q.id,subject:q.subject,title:q.topic,mastery:ok?55:38,errors:ok?0:1};d.topics.push(topic);}else{topic.mastery=Math.max(0,Math.min(100,(Number(topic.mastery)||0)+(ok?2:-4)));if(!ok)topic.errors=(Number(topic.errors)||0)+1;}if(!ok)d.errors.push({id:"exam-error-"+Date.now()+"-"+i,subject:q.subject,topic:q.topic,task:"",reason:"Ошибка в диагностическом экзамене",comment:q.q+" Правильный ответ: "+q.options[q.answer],date:new Date().toLocaleDateString("ru-RU")});});d.answers=d.answers.slice(-1000);d.errors=d.errors.slice(-100);
 d.quizHistory.unshift({date:new Date().toLocaleDateString("ru-RU"),subject:ex.subject+" · экзамен",total:ex.pool.length,score:correct});d.quizHistory=d.quizHistory.slice(0,50);persist();API.renderAll();
 const pct=Math.round(correct/ex.pool.length*100);
 $("#exam-live").hidden=true;$("#exam-setup").hidden=false;
 $("#exam-result").innerHTML='<div class="exam-result"><p class="eyebrow">РЕЗУЛЬТАТ '+(timeout?"· ВРЕМЯ ВЫШЛО":"")+'</p><h3>'+correct+' из '+ex.pool.length+'</h3><strong>'+pct+'% правильных ответов</strong><p>Диагностический результат. Это не первичный балл и не прогноз официального результата ЕГЭ.</p><h4>Разбор ошибок</h4>'+ex.pool.map((q,i)=>'<div class="exam-review"><b>'+(i+1)+'. '+(ex.answers[i]===q.answer?"Верно":"Ошибка")+' · '+esc(q.topic)+'</b><p>'+esc(q.explain)+'</p></div>').join("")+'<button class="primary-button" id="exam-again">Пройти ещё раз</button></div>';
 $("#exam-again").addEventListener("click",()=>{$("#exam-result").innerHTML="";startExam();});
 state.exam=null;renderPlan();
}
function bind(){
 $("#catalog-subject").addEventListener("change",()=>renderCatalog());
 $("#catalog-number").addEventListener("change",()=>renderCatalog());
 $("#catalog-search").addEventListener("input",()=>renderCatalog());
 $("#catalog-detail").addEventListener("click",e=>{if(e.target.id!=="catalog-practice")return;const num=$("#catalog-number").value;const subject=$("#catalog-subject").value;const topic=maps[subject].find(x=>x[0]===num);const pool=API.getQuestions().filter(q=>q.subject===subject);if(pool.length){$("#quiz-subject").value=subject;$("#quiz-count").value="all";document.querySelector('[data-tab="training"]').click();const start=$("#start-quiz");start.click();}else window.open(officialBank,"_blank","noopener");});
 $("#exam-start").addEventListener("click",startExam);
 $("#plan-refresh").addEventListener("click",renderPlan);
 document.querySelectorAll(".nav-item").forEach(b=>{if(!b.dataset.advancedBound){b.dataset.advancedBound="1";b.addEventListener("click",()=>{if(b.dataset.tab==="catalog")renderCatalog();if(b.dataset.tab==="plan")renderPlan();});}});
}
addPanel();bind();renderCatalog();renderPlan();renderAnalytics();
window.addEventListener("beforeunload",()=>clearInterval(state.timer));
})();