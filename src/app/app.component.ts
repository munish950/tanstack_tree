import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  inject
} from '@angular/core'
import {
  CellContext,
  ColumnDef,
  createAngularTable,
  ExpandedState,
  flexRenderComponent,
  FlexRenderDirective,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/angular-table'
import { Person, PersonService } from './services/person.service'
import { ReactiveFormsModule } from '@angular/forms'
import { ExpandableCell, ExpandableHeaderCell } from './expandable-cell'

  // {
  //   accessorKey: 'firstName',
  //   header: () =>
  //     flexRenderComponent(ExpandableHeaderCell, {
  //       inputs: {
  //         label: 'First name',
  //       },
  //     }),
  //     cell: (info: CellContext<Person, string>) =>
  //       flexRenderComponent(ExpandableCell, {
  //         inputs: {
  //           row: info.row,
  //           value: info.getValue(),
  //         },
  //       }),
  // },
const defaultColumns: ColumnDef<Person>[] = [
  {
    accessorFn: (row: Person): string => row.firstName,
    id: 'firstName',
    cell: (info: CellContext<Person, unknown>) => 
            flexRenderComponent(ExpandableCell<Person>, {
          inputs: {
            row: info.row,
            value: info.getValue(),
            getChildren: (row: Person) => row.children ?? []
          },
        }),
    header: () => 'First Name',
    footer: props => props.column.id,
  },
  {
    accessorFn: (row: Person) => row.lastName,
    id: 'lastName',
    cell: info => info.getValue(),
    header: () => 'Last Name',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'age',
    header: () => 'Age',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'visits',
    header: () => `Visits`,
    footer: props => props.column.id,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'progress',
    header: 'Profile Progress',
    footer: props => props.column.id,
  },
]

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FlexRenderDirective, ReactiveFormsModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly personService = inject(PersonService)
  readonly data = signal<Person[]>([])
  readonly expanded = signal<ExpandedState>({})

  ngOnInit(): void {
    this.personService.getRootNodes().subscribe(data => {
      console.log('data', data);
      this.data.set(data)
    })
  }

  readonly table = createAngularTable(() => ({
    data: this.data(),
    columns: defaultColumns,
    state: {
      expanded: this.expanded(),
    },
    onExpandedChange: updater => {
      console.log('here');
      const expanded = typeof updater === 'function'
        ? updater(this.expanded())
        : updater

      this.expanded.set(expanded)

      // Fetch children for newly expanded rows
      Object.keys(expanded).forEach(rowId => {
        if (expanded !== true && expanded[rowId]) {
          const row = this.data().find(p => p.id === rowId)
          if (row && !row.subRows) {
            this.personService.getChildren(rowId).subscribe(children => {
              row.subRows = children
              this.data.set([...this.data()]) // Trigger re-render
            })
          }
        }
      })
    },
    getSubRows: (row: Person) => row.subRows ?? [],
    manualExpanding: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  }))

  readonly rawExpandedState = computed(() =>
    JSON.stringify(this.expanded(), undefined, 2)
  )

  readonly rawRowSelectionState = computed(() =>
    JSON.stringify(this.table.getState().rowSelection, undefined, 2)
  )

  onPageInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement
    const page = inputElement.value ? Number(inputElement.value) - 1 : 0
    this.table.setPageIndex(page)
  }

  onPageSizeChange(event: any): void {
    this.table.setPageSize(Number(event.target.value))
  }
}
