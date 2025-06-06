<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Http\Requests\CustomerRequest;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = auth()->user()->customers()
            ->with('user')
            ->latest()
            ->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    public function store(CustomerRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();

        Customer::create($validated);

        return redirect()->route('customers.index')
            ->with('message', 'Customer created successfully.');
    }

    public function edit(Customer $customer)
    {
        if (! Gate::allows('update', $customer)) {
            abort(403);
        }

        return Inertia::render('Customers/Edit', [
            'customer' => $customer
        ]);
    }

    public function update(CustomerRequest $request, Customer $customer)
    {
        if (! Gate::allows('update', $customer)) {
            abort(403);
        }

        $customer->update($request->validated());

        return redirect()->route('customers.index')
            ->with('message', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        if (! Gate::allows('delete', $customer)) {
            abort(403);
        }
        
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('message', 'Customer deleted successfully.');
    }
} 