import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function NewRecipe() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>New Recipe</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>New Recipe</DialogTitle>
					<DialogDescription>
						Enter a link to a recipe you want to add.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="link" className="text-right">
							Link
						</Label>
						<Input id="link" className="col-span-3" />
					</div>
				</div>
				<DialogFooter>
					<Button type="submit">Create</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
