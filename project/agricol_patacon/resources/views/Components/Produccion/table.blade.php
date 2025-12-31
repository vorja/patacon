@props(['name'])

<div class="table-container">
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="fw-bold"> {{ ucfirst($name) }}</h2>
    </div>


    <div id="tabla-dinamica" data-modulo="{{ $name }}">

    </div>

    @includeIf('components.modals.create.' . $name)
    @includeIf('components.modals.info.' . $name)
</div>