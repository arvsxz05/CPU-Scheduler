class Process {
	constructor(name, arrival, burst, priority) {
		this.name = name;
		this.arrival = arrival;
		this.burst = burst;
		this.priority = priority;
		this.remain = burst;
		this.color = getRandomColor();
	}
}

class System {
	constructor() {
		this.processes = [];
	}

	addProcess(newProcess) {
		if(!newProcess || !(newProcess instanceof Process))
			throw "Process must be valid.";

		this.processes.push(newProcess);
	}

	calculateFCFS() {
		var waiting_times = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			cumulative += current_time;
			waiting_times.push({process: this.processes[i], waiting_time: current_time});
			current_time += this.processes[i].burst;
		}

		return {waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time, cumulative: cumulative};
	}

	calculateSJF() {
		var waiting_times = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			waiting_times.push({process: this.processes[i], waiting_time: 0});
		}

		waiting_times.sort(function(a, b) {
			var x = a['process'].burst; var y = b['process'].burst;
			var c = a['process'].arrival; var d = b['process'].arrival;
			return ((x < y) ? -1 : ((x > y) ? 1 : ((c < d) ? -1 : ((c > d) ? 1 : 0))));
		});

		for(var i = 0; i < waiting_times.length; i++) {
			cumulative += current_time;
			waiting_times[i].waiting_time = current_time;
			current_time += waiting_times[i].process.burst;
		}

		return {waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time, cumulative: cumulative};
	}

	calculatePriority() {
		var waiting_times = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			waiting_times.push({process: this.processes[i], waiting_time: 0});
		}

		waiting_times.sort(function(a, b) {
			var x = a['process'].priority; var y = b['process'].priority;
			var c = a['process'].arrival; var d = b['process'].arrival;
			return ((x < y) ? -1 : ((x > y) ? 1 : ((c < d) ? -1 : ((c > d) ? 1 : 0))));
		});

		for(var i = 0; i < waiting_times.length; i++) {
			cumulative += current_time;
			waiting_times[i].waiting_time = current_time;
			current_time += waiting_times[i].process.burst;
		}

		return {waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time, cumulative: cumulative};
	}

	calculateRoundRobin(timeslice) {
		var waiting_times = [];
		var job_order = [];
		var process_w_time = [];
		var current_time = 0;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			waiting_times.push({process: this.processes[i], waiting_time: null});
			process_w_time.push({process: this.processes[i], remain: this.processes[i].burst});
		}

		var ctr = 0;
		while(process_w_time.length > 0) {
			var time;
			ctr %= process_w_time.length;
			if(process_w_time[ctr].remain > 0) {
				if(timeslice >= process_w_time[ctr].remain) {
					job_order.push({process: process_w_time[ctr].process, time_occured: current_time, remain: 0});
					current_time += process_w_time[ctr].remain;
					process_w_time[ctr].remain = 0;
					process_w_time.splice(ctr, 1);
					ctr--;
				} else {
					process_w_time[ctr].remain -= timeslice;
					job_order.push({process: process_w_time[ctr].process, time_occured: current_time, remain: process_w_time[ctr].remain});
					current_time += timeslice;
				}
			}
			++ctr;
		}

		for (var i = job_order.length - 1; i >= 0; i--) {
			var temp_process = job_order[i].process;
			var upd_wait = waiting_times.find(function (curr_process) {
				if(temp_process == curr_process.process) {
					return curr_process;
				}
			});
			if(upd_wait.waiting_time == null)
				upd_wait.waiting_time = job_order[i].time_occured;
			else {
				upd_wait.waiting_time -= timeslice;
			}
		}

		for (var i = waiting_times.length - 1; i >= 0; i--) {
			cumulative += waiting_times[i].waiting_time;
		}

		return {job_order: job_order, waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time, cumulative: cumulative};
	}

	calculateSRPT() {
		var waiting_times = [];
		var job_order = [];
		var ordered_list_arrival = [];
		var queue = [];
		var current_time = 0;
		var currentProcess = null;
		var cumulative = 0;

		for(var i = 0; i < this.processes.length; i++) {
			waiting_times.push({process: this.processes[i], waiting_time: null});
			ordered_list_arrival.push({process: this.processes[i], remaining: this.processes[i].burst});
		}

		ordered_list_arrival.sort(function(a, b) {
			var x = a.process.arrival; var y = b.process.arrival;
			var c = a.process.burst; var d = b.process.burst;
			return ((x < y) ? -1 : ((x > y) ? 1 : ((c < d) ? -1 : ((c > d) ? 1 : 0))));
		});

		do {
			while(ordered_list_arrival.length > 0 && ordered_list_arrival[0].process.arrival == current_time) {
				binaryInsert(ordered_list_arrival.shift(), queue);
			}

			if(currentProcess == null && queue.length > 0)
				currentProcess = queue.shift();

			if(queue.length > 0 && queue[0].remaining < currentProcess.remaining) {
				var temp = currentProcess;
				currentProcess = queue.shift();
				binaryInsert(temp, queue);
			}
			if(currentProcess != null) {
				job_order.push({process: currentProcess.process, time_occured: current_time});
				currentProcess.remaining--;
			}
			current_time++;
			if(currentProcess && currentProcess.remaining <= 0)
				currentProcess = null;

		} while (currentProcess != null || queue.length != 0 || ordered_list_arrival.length != 0);

		// console.log(job_order);

		job_order = merge(job_order);

		for (var i = this.processes.length - 1; i >= 0; i--) {
			this.processes[i].remain = this.processes[i].burst;
		}

		var current_time2 = current_time;

		for (var i = job_order.length - 1; i >= 0; i--) {
			var proc_length = current_time2 - job_order[i].time_occured;
			current_time2 = current_time2 - proc_length;
			var upd_wait = waiting_times.find(function (curr_process) {
				if(job_order[i].process == curr_process.process) {
					return curr_process;
				}
			});
			if(upd_wait.waiting_time == null) {
				upd_wait.waiting_time = job_order[i].time_occured - job_order[i].process.arrival;
			}
			else {
				upd_wait.waiting_time -= proc_length;
			}
		}

		for (var i = waiting_times.length - 1; i >= 0; i--) {
			cumulative += waiting_times[i].waiting_time;
		}
		return {job_order: job_order, waiting_times: waiting_times, average_wt: cumulative/this.processes.length, time: current_time, cumulative: cumulative};
	}
}

function binaryInsert(item, array, startVal, endVal){
	var length = array.length;
	var start = typeof(startVal) != 'undefined' ? startVal : 0;
	var end = typeof(endVal) != 'undefined' ? endVal : length - 1;
	var m = start + Math.floor((end - start)/2);
	
	if(length == 0){
		array.push(item);
		return;
	}

	if(item.remaining > array[end].remaining) {
		array.splice(end + 1, 0, item);
		return;
	}

	if(item.remaining < array[start].remaining) {
		array.splice(start, 0, item);
		return;
	}

	if(item.remaining == array[end].remaining) {
		if(item.process.arrival > array[end].process.arrival) {
			array.splice(end + 1, 0, item);
			return;
		}
	}

	if(item.remaining == array[start].remaining) {
		if(item.process.arrival <= array[start].process.arrival) {
			array.splice(start, 0, item);
			return;
		}
	}

	if(start >= end){
		return;
	}

	if(item.remaining < array[m].remaining) {
		binaryInsert(item, array, start, m - 1);
		return;
	}

	if(item.remaining > array[m].remaining) {
		binaryInsert(item, array, m + 1, end);
		return;
	}

	if(item.remaining == array[m].remaining) {
		if(item.process.arrival <= array[m].process.arrival) {
			binaryInsert(item, array, start, m - 1);
			return;
		}

		if(item.process.arrival > array[m].process.arrival) {
			binaryInsert(item, array, m + 1, end);
			return;
		}
	}
}

function merge(job_order) {
	var current_time = 0, ctr = -1;
	var merged_job_order = [];
	for(var i = 0; i < job_order.length; i++) {
		if(merged_job_order.length == 0 || merged_job_order[ctr].process != job_order[i].process) {
			merged_job_order.push({process: job_order[i].process, time_occured: job_order[i].time_occured, remain: job_order[i].process.burst});
			if(ctr != -1) {
				merged_job_order[ctr].process.remain -= current_time - merged_job_order[ctr].time_occured;
				merged_job_order[ctr].remain = merged_job_order[ctr].process.remain;
			}
			ctr++;
		}
		current_time++;
	}

	if(ctr != -1) {
		merged_job_order[ctr].process.remain -= current_time - merged_job_order[ctr].time_occured;
		merged_job_order[ctr].remain = merged_job_order[ctr].process.remain;
	}

	return merged_job_order;
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}